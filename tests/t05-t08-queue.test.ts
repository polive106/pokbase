import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { submit } from '../src/ingest/submit.js';
import { workerLoop } from '../src/ingest/worker.js';
import { mockIngestModel } from '../src/lib/mock-model.js';
import { seed } from '../src/seed.js';
import { FIXTURE, record, sleep, spawnWorker, stopChild, testEnv, waitFor, src } from './helpers.js';

const snapshotRaw = (dir: string) =>
  Object.fromEntries(readdirSync(dir).sort().map((f) => [f, { sha: createHash('sha256').update(readFileSync(path.join(dir, f))).digest('hex'), mtime: statSync(path.join(dir, f)).mtimeMs }]));

describe('T5 Submit and dedupe [assert]', () => {
  it('stores one raw file and one source row for byte-identical sources', async () => {
    const t = await testEnv('t05');
    const r1 = await submit(src('src-01'), { queue: t.queue, rawDir: t.rawDir, submitter: 'alice' });
    const before = snapshotRaw(t.rawDir);
    const r5 = await submit(src('src-05'), { queue: t.queue, rawDir: t.rawDir, submitter: 'bob' });
    const r1again = await submit(src('src-01'), { queue: t.queue, rawDir: t.rawDir, submitter: 'bob' });
    const after = snapshotRaw(t.rawDir);
    const sources = await t.queue.all('SELECT sha256, status, submitter FROM source');
    const jobs = await t.queue.all('SELECT id, state FROM job');
    const rawContent = Object.keys(after).filter((f) => !f.endsWith('.json'));
    record('t05', { status: 'PASS', r1: r1.status, r5: r5.status, r1again: r1again.status, rawFiles: Object.keys(after), sourceRows: sources, jobs, rawUnchanged: JSON.stringify(before) === JSON.stringify(after) });
    expect(r1.status).toBe('queued');
    expect(r5.status).toBe('duplicate');
    expect(r1again.status).toBe('duplicate');
    expect(rawContent).toHaveLength(1);
    expect(sources).toHaveLength(1);
    expect(jobs).toHaveLength(1);
    expect(after).toEqual(before); // raw/ never modified
    await t.close();
  });
});

describe('T6 Job batching [assert]', () => {
  it('four quick submissions → one job, one agent run over all four', async () => {
    const t = await testEnv('t06');
    await seed(t.knowledge, FIXTURE);
    const results = [];
    const started = Date.now();
    for (const n of ['src-01', 'src-02', 'src-03', 'src-04']) results.push(await submit(src(n), { queue: t.queue, rawDir: t.rawDir }));
    const submitMs = Date.now() - started;
    const jobsBefore = await t.queue.all('SELECT id, state FROM job');
    await workerLoop({ knowledge: t.knowledge, queue: t.queue, worker: 't06-worker', once: true, model: mockIngestModel(), rawDir: t.rawDir });
    const runs = await t.queue.all('SELECT run_id, sources, outcome FROM ingest_run');
    const jobs = await t.queue.all('SELECT id, state, outcome FROM job');
    const statuses = await t.queue.all('SELECT status, COUNT(*) n FROM source GROUP BY status');
    record('t06', { status: 'PASS', submitMs, submitStatuses: results.map((r) => r.status), jobsBefore, jobs, runs: runs.map((r: any) => ({ ...r, sources: JSON.parse(r.sources).length })), statuses });
    expect(submitMs).toBeLessThan(1000);
    expect(results.map((r) => r.status)).toEqual(['queued', 'absorbed', 'absorbed', 'absorbed']);
    expect(jobsBefore).toHaveLength(1);
    expect(runs).toHaveLength(1);
    expect(JSON.parse((runs[0] as any).sources)).toHaveLength(4);
    expect((runs[0] as any).outcome).toBe('committed');
    await t.close();
  });
});

const DURATION = Number(process.env.T7_DURATION_MS ?? 60_000);

describe('T7 Single ingest per KB [assert]', () => {
  it(`two workers, continuous submissions for ${DURATION / 1000}s: never two runs at once, each source finalised once`, async () => {
    const t = await testEnv('t07');
    await seed(t.knowledge, FIXTURE);
    const extra = { MOCK_STEP_DELAY_MS: '150', LEASE_TTL_MS: '4000', POLL_MS: '100', BATCH_CAP: '5' };
    const w1 = spawnWorker(t.env, 't07-w1', extra);
    const w2 = spawnWorker(t.env, 't07-w2', extra);
    const incoming = path.join(t.dir, 'incoming');
    mkdirSync(incoming, { recursive: true });
    let n = 0;
    const end = Date.now() + DURATION;
    try {
      while (Date.now() < end) {
        const f = path.join(incoming, `gen-${n}.md`);
        writeFileSync(f, `# Generated source ${n}\n\nSynthetic fact number ${n} about Kelvara, created at ${Date.now()}.\n`);
        await submit(f, { queue: t.queue, rawDir: t.rawDir, submitter: n % 2 ? 'bob' : 'alice' });
        n++;
        await sleep(200 + Math.random() * 400);
      }
      await waitFor(async () => {
        const r = await t.queue.all<{ n: number }>(`SELECT COUNT(*) n FROM source WHERE status = 'pending'`);
        return Number(r[0].n) === 0;
      }, 120_000, 'all sources finalised');
    } finally {
      await stopChild(w1);
      await stopChild(w2);
    }
    const runs = await t.queue.all<any>('SELECT run_id, worker, epoch, started_at, ended_at, outcome, sources FROM ingest_run ORDER BY started_at');
    const overlaps: any[] = [];
    for (let i = 1; i < runs.length; i++) {
      const prevEnd = Math.max(...runs.slice(0, i).map((r) => Number(r.ended_at ?? Infinity)));
      if (Number(runs[i].started_at) < prevEnd) overlaps.push({ run: runs[i].run_id, startedAt: runs[i].started_at, previousEnd: prevEnd });
    }
    const terminal = await t.queue.all<any>(`SELECT sha256, COUNT(*) n FROM source_event WHERE status IN ('ingested','failed') GROUP BY sha256`);
    const notOnce = terminal.filter((r) => Number(r.n) !== 1);
    const statuses = await t.queue.all('SELECT status, COUNT(*) n FROM source GROUP BY status');
    const byWorker = runs.reduce<Record<string, number>>((a, r) => ((a[r.worker] = (a[r.worker] ?? 0) + 1), a), {});
    record('t07', {
      status: overlaps.length || notOnce.length || terminal.length !== n ? 'FAIL' : 'PASS',
      durationMs: DURATION,
      submitted: n,
      runs: runs.length,
      runsByWorker: byWorker,
      outcomes: runs.reduce<Record<string, number>>((a, r) => ((a[r.outcome] = (a[r.outcome] ?? 0) + 1), a), {}),
      maxBatch: Math.max(...runs.map((r) => JSON.parse(r.sources).length)),
      overlaps,
      sourcesFinalisedOnce: terminal.length,
      notOnce,
      statuses,
    });
    expect(overlaps).toEqual([]);
    expect(notOnce).toEqual([]);
    expect(terminal.length).toBe(n);
    await t.close();
  });
});

describe('T8 Lease fencing [assert]', () => {
  it('a worker paused past its lease is fenced; the new holder re-processes its sources', async () => {
    const t = await testEnv('t08');
    await seed(t.knowledge, FIXTURE);
    const lease = { LEASE_TTL_MS: '2000', POLL_MS: '100' };
    for (const n of ['src-01', 'src-02']) await submit(src(n), { queue: t.queue, rawDir: t.rawDir });
    const a = spawnWorker(t.env, 't08-A', { ...lease, MOCK_STEP_DELAY_MS: '2500' }); // slow: still mid-run when paused
    let b: ReturnType<typeof spawnWorker> | undefined;
    try {
      const runA = await waitFor(async () => (await t.queue.all<any>(`SELECT run_id FROM ingest_run WHERE worker = 't08-A'`))[0], 60_000, 'worker A run start');
      await sleep(300);
      process.kill(a.pid!, 'SIGSTOP');
      const pausedAt = Date.now();
      await sleep(3000); // > lease TTL: A's lease expires while it is stopped
      b = spawnWorker(t.env, 't08-B', { ...lease, MOCK_STEP_DELAY_MS: '50' });
      await waitFor(async () => {
        const r = await t.queue.all<any>(`SELECT COUNT(*) n FROM source WHERE status = 'ingested'`);
        return Number(r[0].n) === 2;
      }, 60_000, 'worker B to ingest both sources');
      process.kill(a.pid!, 'SIGCONT');
      const resumedAt = Date.now();
      const aDone = await waitFor(async () => (await t.queue.all<any>(`SELECT outcome FROM ingest_run WHERE run_id = ?`, [runA.run_id]))[0]?.outcome, 60_000, 'worker A to finish');
      const runs = await t.queue.all<any>('SELECT run_id, worker, epoch, outcome, sources FROM ingest_run ORDER BY started_at');
      const sources = await t.queue.all<any>('SELECT substr(sha256,1,12) id, status, run_id FROM source');
      const events = await t.queue.all<any>(`SELECT substr(sha256,1,12) id, status, run_id, epoch FROM source_event WHERE status <> 'pending'`);
      const logA = JSON.parse(readFileSync(path.join(t.runLogDir, `${runA.run_id}.json`), 'utf8'));
      const aWritesAfterResume = logA.toolCalls.filter((c: any) => c.kind === 'write' && Date.parse(c.at) >= resumedAt - 50);
      record('t08', {
        status: aDone === 'fenced' && sources.every((s) => s.run_id !== runA.run_id) ? 'PASS' : 'FAIL',
        pausedForMs: resumedAt - pausedAt,
        runA: { runId: runA.run_id, outcome: aDone, writesAfterResume: aWritesAfterResume.map((c: any) => ({ tool: c.tool, ok: c.ok, error: c.error })), writesBeforePause: logA.toolCalls.filter((c: any) => c.kind === 'write' && Date.parse(c.at) < pausedAt).length },
        runs: runs.map((r) => ({ ...r, sources: JSON.parse(r.sources).length })),
        sources,
        terminalEvents: events,
        workerAOutput: a.output.join('').split('\n').filter(Boolean).slice(-6),
      });
      expect(aDone).toBe('fenced');
      expect(sources.every((s) => s.status === 'ingested' && s.run_id !== runA.run_id)).toBe(true);
      expect(aWritesAfterResume.every((c: any) => !c.ok)).toBe(true);
      expect(events).toHaveLength(2);
    } finally {
      await stopChild(a);
      if (b) await stopChild(b);
      await t.close();
    }
  });
});
