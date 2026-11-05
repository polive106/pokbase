import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createClient, type Client, type Transaction } from '@libsql/client';
import { config } from '../config.js';
import { assertUnderData } from '../store.js';

/**
 * The ingest queue, KB lease and source ledger, in one SQLite file (WAL; several processes share it).
 *
 * Replaces the spec's Postgres + Graphile Worker (see FINDINGS "Spec vs reality"): the semantics
 * the tests need are the same —
 *   - `source.sha256` primary key → one row per distinct file;
 *   - one *queued* job per KB (partial unique index on job_key WHERE state='queued'): a queued job
 *     absorbs new sources; submit inserts the source and the job in one transaction;
 *   - a KB lease row (holder, epoch, expires_at) renewed by heartbeat; takeover bumps the epoch;
 *     results are committed only if the epoch still matches (fencing). No advisory locks.
 */
export type SourceRow = {
  sha256: string;
  kb: string;
  ext: string;
  original_name: string;
  submitter: string;
  submitted_at: number;
  status: 'pending' | 'ingested' | 'failed';
  attempts: number;
  last_error: string | null;
  run_id: string | null;
};

export type Lease = { kb: string; holder: string; epoch: number };
export type Job = { id: number; kb: string };

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS source (
     sha256 TEXT PRIMARY KEY, kb TEXT NOT NULL, ext TEXT NOT NULL, original_name TEXT NOT NULL,
     submitter TEXT NOT NULL, submitted_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
     attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, run_id TEXT, updated_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS source_kb_status ON source(kb, status, submitted_at)`,
  `CREATE TABLE IF NOT EXISTS job (
     id INTEGER PRIMARY KEY AUTOINCREMENT, job_key TEXT NOT NULL, kb TEXT NOT NULL,
     state TEXT NOT NULL DEFAULT 'queued', created_at INTEGER NOT NULL, holder TEXT, epoch INTEGER,
     started_at INTEGER, finished_at INTEGER, outcome TEXT)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS job_one_queued_per_key ON job(job_key) WHERE state = 'queued'`,
  `CREATE TABLE IF NOT EXISTS kb_lease (kb TEXT PRIMARY KEY, holder TEXT, epoch INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS source_event (
     id INTEGER PRIMARY KEY AUTOINCREMENT, sha256 TEXT NOT NULL, status TEXT NOT NULL, run_id TEXT, epoch INTEGER, at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS pending_review (
     id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL, agent_run_id TEXT NOT NULL, tool_call_id TEXT,
     tool TEXT NOT NULL, args TEXT NOT NULL, decision TEXT, reason TEXT, created_at INTEGER NOT NULL, decided_at INTEGER)`,
  `CREATE TABLE IF NOT EXISTS ingest_run (
     run_id TEXT PRIMARY KEY, kb TEXT NOT NULL, worker TEXT NOT NULL, epoch INTEGER NOT NULL, job_id INTEGER,
     started_at INTEGER NOT NULL, ended_at INTEGER, outcome TEXT, sources TEXT)`,
];

const jobKey = (kb: string) => `ingest:${kb}`;

export class Queue {
  private constructor(readonly db: Client, readonly file: string) {}

  static async open(file = config.queueDbFile): Promise<Queue> {
    assertUnderData(file);
    mkdirSync(path.dirname(file), { recursive: true });
    const db = createClient({ url: `file:${file}` });
    await db.execute('PRAGMA journal_mode=WAL');
    await db.execute('PRAGMA busy_timeout=10000');
    for (const s of SCHEMA) await retryBusy(() => db.execute(s));
    return new Queue(db, file);
  }

  close() {
    this.db.close();
  }

  private async tx<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return retryBusy(async () => {
      const tx = await this.db.transaction('write'); // BEGIN IMMEDIATE
      try {
        const r = await fn(tx);
        await tx.commit();
        return r;
      } catch (e) {
        await tx.rollback().catch(() => {});
        throw e;
      } finally {
        tx.close();
      }
    });
  }

  /** Inserts the source row and enqueues (or joins) the KB's queued job, atomically. */
  async submitSource(s: Omit<SourceRow, 'status' | 'attempts' | 'last_error' | 'run_id'>): Promise<{ status: 'queued' | 'absorbed' | 'duplicate'; jobId?: number }> {
    return this.tx(async (tx) => {
      const ins = await tx.execute({
        sql: `INSERT OR IGNORE INTO source (sha256, kb, ext, original_name, submitter, submitted_at, updated_at) VALUES (?,?,?,?,?,?,?)`,
        args: [s.sha256, s.kb, s.ext, s.original_name, s.submitter, s.submitted_at, Date.now()],
      });
      if (ins.rowsAffected === 0) return { status: 'duplicate' as const };
      await tx.execute({ sql: `INSERT INTO source_event (sha256, status, at) VALUES (?, 'pending', ?)`, args: [s.sha256, Date.now()] });
      const job = await tx.execute({
        sql: `INSERT OR IGNORE INTO job (job_key, kb, created_at) VALUES (?, ?, ?)`,
        args: [jobKey(s.kb), s.kb, Date.now()],
      });
      const row = await tx.execute({ sql: `SELECT id FROM job WHERE job_key = ? AND state = 'queued'`, args: [jobKey(s.kb)] });
      return { status: job.rowsAffected ? ('queued' as const) : ('absorbed' as const), jobId: Number(row.rows[0]?.id) };
    });
  }

  /**
   * Takes work: the oldest queued job, or a running job whose holder's lease expired, for a KB
   * whose lease is free (or expired). Acquires the lease (epoch+1) and claims the job in one
   * transaction. Returns null when there is nothing to do or the KB is held by a live worker.
   */
  async takeWork(holder: string, ttlMs = config.leaseTtlMs): Promise<{ job: Job; lease: Lease } | null> {
    const candidateSql = `SELECT j.id, j.kb FROM job j LEFT JOIN kb_lease l ON l.kb = j.kb
              WHERE (j.state = 'queued' OR j.state = 'running')
                AND (l.kb IS NULL OR l.expires_at < ? OR l.holder IS NULL)
              ORDER BY CASE j.state WHEN 'running' THEN 0 ELSE 1 END, j.id LIMIT 1`;
    // Cheap read first (no write lock under WAL); take BEGIN IMMEDIATE only when there may be work.
    if (!(await this.all(candidateSql, [Date.now()])).length) return null;
    return this.tx(async (tx) => {
      const now = Date.now();
      const r = (await tx.execute({ sql: candidateSql, args: [now] })).rows[0]; // re-check under the lock
      if (!r) return null;
      const kb = String(r.kb);
      await tx.execute({ sql: `INSERT OR IGNORE INTO kb_lease (kb, holder, epoch, expires_at) VALUES (?, NULL, 0, 0)`, args: [kb] });
      await tx.execute({ sql: `UPDATE kb_lease SET holder = ?, epoch = epoch + 1, expires_at = ? WHERE kb = ?`, args: [holder, now + ttlMs, kb] });
      const lease = await tx.execute({ sql: `SELECT epoch FROM kb_lease WHERE kb = ?`, args: [kb] });
      const epoch = Number(lease.rows[0].epoch);
      // Taking over a running job: other jobs of the same KB that were orphaned are folded into this one.
      await tx.execute({
        sql: `UPDATE job SET state = 'superseded', finished_at = ?, outcome = 'taken over' WHERE kb = ? AND state = 'running' AND id <> ?`,
        args: [now, kb, r.id],
      });
      await tx.execute({ sql: `UPDATE job SET state = 'running', holder = ?, epoch = ?, started_at = ? WHERE id = ?`, args: [holder, epoch, now, r.id] });
      return { job: { id: Number(r.id), kb }, lease: { kb, holder, epoch } };
    });
  }

  /** Heartbeat. False when the lease was lost (someone else took over, or the epoch moved). */
  async renewLease(lease: Lease, ttlMs = config.leaseTtlMs): Promise<boolean> {
    const now = Date.now();
    const r = await retryBusy(() =>
      this.db.execute({
        sql: `UPDATE kb_lease SET expires_at = ? WHERE kb = ? AND holder = ? AND epoch = ? AND expires_at >= ?`,
        args: [now + ttlMs, lease.kb, lease.holder, lease.epoch, now],
      }),
    );
    return r.rowsAffected === 1;
  }

  /** Whether `lease` is still the current, unexpired lease. Used to fence writes before they happen. */
  async holds(lease: Lease): Promise<boolean> {
    const r = await retryBusy(() => this.db.execute({ sql: `SELECT holder, epoch, expires_at FROM kb_lease WHERE kb = ?`, args: [lease.kb] }));
    const row = r.rows[0];
    return !!row && row.holder === lease.holder && Number(row.epoch) === lease.epoch && Number(row.expires_at) >= Date.now();
  }

  async pendingSources(kb: string, limit = config.batchCap): Promise<SourceRow[]> {
    const r = await this.db.execute({ sql: `SELECT * FROM source WHERE kb = ? AND status = 'pending' ORDER BY submitted_at, sha256 LIMIT ?`, args: [kb, limit] });
    return r.rows as unknown as SourceRow[];
  }

  async recordRunStart(run: { runId: string; kb: string; worker: string; epoch: number; jobId: number; sources: string[] }) {
    await retryBusy(() =>
      this.db.execute({
        sql: `INSERT INTO ingest_run (run_id, kb, worker, epoch, job_id, started_at, sources) VALUES (?,?,?,?,?,?,?)`,
        args: [run.runId, run.kb, run.worker, run.epoch, run.jobId, Date.now(), JSON.stringify(run.sources)],
      }),
    );
  }

  /**
   * Commits a batch's outcome if and only if `lease` is still current. On success: sources →
   * ingested (or attempts+1 / failed), job → done, follow-up job enqueued if sources remain, lease
   * released. Returns 'fenced' (and changes nothing but the run row) when the epoch moved.
   */
  async finishBatch(input: { lease: Lease; jobId: number; runId: string; sources: string[]; error?: string }): Promise<'committed' | 'fenced'> {
    const { lease, jobId, runId, sources, error } = input;
    return this.tx(async (tx) => {
      const now = Date.now();
      const l = await tx.execute({ sql: `SELECT holder, epoch FROM kb_lease WHERE kb = ?`, args: [lease.kb] });
      const cur = l.rows[0];
      if (!cur || cur.holder !== lease.holder || Number(cur.epoch) !== lease.epoch) {
        await tx.execute({ sql: `UPDATE ingest_run SET ended_at = ?, outcome = 'fenced' WHERE run_id = ?`, args: [now, runId] });
        return 'fenced' as const;
      }
      for (const sha of sources) {
        if (!error) {
          await tx.execute({ sql: `UPDATE source SET status = 'ingested', run_id = ?, last_error = NULL, updated_at = ? WHERE sha256 = ? AND status = 'pending'`, args: [runId, now, sha] });
          await tx.execute({ sql: `INSERT INTO source_event (sha256, status, run_id, epoch, at) VALUES (?, 'ingested', ?, ?, ?)`, args: [sha, runId, lease.epoch, now] });
        } else {
          await tx.execute({
            sql: `UPDATE source SET attempts = attempts + 1, last_error = ?, updated_at = ?,
                    status = CASE WHEN attempts + 1 >= ? THEN 'failed' ELSE 'pending' END, run_id = ? WHERE sha256 = ? AND status = 'pending'`,
            args: [error, now, config.maxAttempts, runId, sha],
          });
          const st = await tx.execute({ sql: `SELECT status FROM source WHERE sha256 = ?`, args: [sha] });
          if (st.rows[0]?.status === 'failed')
            await tx.execute({ sql: `INSERT INTO source_event (sha256, status, run_id, epoch, at) VALUES (?, 'failed', ?, ?, ?)`, args: [sha, runId, lease.epoch, now] });
        }
      }
      await tx.execute({ sql: `UPDATE job SET state = 'done', finished_at = ?, outcome = ? WHERE id = ?`, args: [now, error ? 'error' : 'ok', jobId] });
      const left = await tx.execute({ sql: `SELECT COUNT(*) AS n FROM source WHERE kb = ? AND status = 'pending'`, args: [lease.kb] });
      if (Number(left.rows[0].n) > 0) await tx.execute({ sql: `INSERT OR IGNORE INTO job (job_key, kb, created_at) VALUES (?, ?, ?)`, args: [jobKey(lease.kb), lease.kb, now] });
      await tx.execute({ sql: `UPDATE kb_lease SET holder = NULL, expires_at = 0 WHERE kb = ? AND holder = ? AND epoch = ?`, args: [lease.kb, lease.holder, lease.epoch] });
      await tx.execute({ sql: `UPDATE ingest_run SET ended_at = ?, outcome = ? WHERE run_id = ?`, args: [now, error ? 'error' : 'committed', runId] });
      return 'committed' as const;
    });
  }

  /** Closes a job that had no pending sources. */
  async finishEmptyJob(lease: Lease, jobId: number) {
    await this.tx(async (tx) => {
      const now = Date.now();
      await tx.execute({ sql: `UPDATE job SET state = 'done', finished_at = ?, outcome = 'empty' WHERE id = ? AND epoch = ?`, args: [now, jobId, lease.epoch] });
      await tx.execute({ sql: `UPDATE kb_lease SET holder = NULL, expires_at = 0 WHERE kb = ? AND holder = ? AND epoch = ?`, args: [lease.kb, lease.holder, lease.epoch] });
    });
  }

  async all<T = any>(sql: string, args: any[] = []): Promise<T[]> {
    return (await this.run(sql, args)).rows as unknown as T[];
  }

  async run(sql: string, args: any[] = []) {
    return retryBusy(() => this.db.execute({ sql, args }));
  }
}

async function retryBusy<T>(fn: () => Promise<T>, tries = 50): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (i < tries && /SQLITE_BUSY|database is locked/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 80));
        continue;
      }
      throw e;
    }
  }
}
