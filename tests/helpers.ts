import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config, hasRealModel } from '../src/config.js';
import { openKb } from '../src/kb.js';
import { Queue } from '../src/ingest/queue.js';

export const ROOT = config.root;
export const STORE = config.store;
export const FIXTURE = path.join(ROOT, 'fixtures/kelvara-handbook');
export const SOURCES = path.join(ROOT, 'fixtures/sources');
/** Path of the fixture source whose file name starts with `prefix` (e.g. 'src-01'). */
export const src = (prefix: string) => path.join(SOURCES, readdirSync(SOURCES).find((f) => f.startsWith(prefix))!);
export const llmEnabled = () => hasRealModel() && !!process.env.LLM_TESTS;

/** An isolated environment under ./data/tests/<store>-<name>: KB store, queue, raw/, run logs. */
export async function testEnv(name: string) {
  const id = `${STORE}-${name}`;
  const dir = path.join(ROOT, 'data/tests', id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const runLogDir = path.join(ROOT, 'out/test-runs', id);
  rmSync(runLogDir, { recursive: true, force: true });
  const pgSchema = `t_${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now().toString(36)}`.toLowerCase();
  const env: Record<string, string> = {
    STORE,
    DATA_DIR: dir,
    KB_DB: path.join(dir, 'kb.db'),
    QUEUE_DB: path.join(dir, 'queue.db'),
    RAW_DIR: path.join(dir, 'raw'),
    RUN_LOG_DIR: runLogDir,
    KB_PG_SCHEMA: pgSchema,
  };
  process.env.RUN_LOG_DIR = runLogDir;
  const kb = await openKb({ file: env.KB_DB, pgSchema });
  const queue = await Queue.open(env.QUEUE_DB);
  return {
    id,
    dir,
    env,
    kb,
    knowledge: kb.knowledge,
    queue,
    rawDir: env.RAW_DIR,
    runLogDir,
    pgSchema,
    async close() {
      queue.close();
      await kb.close();
    },
  };
}

export function record(test: string, data: unknown) {
  mkdirSync(config.resultsDir, { recursive: true });
  const file = path.join(config.resultsDir, `${test}.json`);
  writeFileSync(file, JSON.stringify({ test, store: STORE, recordedAt: new Date().toISOString(), ...(data as object) }, null, 2) + '\n');
  return file;
}

/** Records BLOCKED, unless a real (LLM) run already recorded observations for this test. */
export function blocked(test: string, reason: string) {
  const file = path.join(config.resultsDir, `${test}.json`);
  try {
    const prev = JSON.parse(readFileSync(file, 'utf8'));
    if (prev.status && prev.status !== 'BLOCKED') return;
  } catch {}
  record(test, { status: 'BLOCKED', reason });
}

/** Spawns a worker process (node + tsx loader directly, so the pid is the worker itself: SIGSTOP works). */
export function spawnWorker(env: Record<string, string>, id: string, extra: Record<string, string> = {}): ChildProcess & { output: string[] } {
  const child = spawn(process.execPath, ['--import', 'tsx', path.join(ROOT, 'src/ingest/worker.ts')], {
    cwd: ROOT,
    env: { ...process.env, ...env, WORKER_ID: id, MODEL: 'mock', ...extra },
    stdio: ['ignore', 'pipe', 'pipe'],
  }) as ChildProcess & { output: string[] };
  child.output = [];
  child.stdout!.on('data', (d) => child.output.push(String(d)));
  child.stderr!.on('data', (d) => child.output.push(String(d)));
  return child;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function waitFor<T>(fn: () => Promise<T | undefined | null | false>, timeoutMs: number, what: string, everyMs = 200): Promise<T> {
  const start = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - start > timeoutMs) throw new Error(`timed out waiting for ${what}`);
    await sleep(everyMs);
  }
}

export function stopChild(c: ChildProcess) {
  return new Promise<void>((resolve) => {
    if (c.exitCode !== null || c.signalCode) return resolve();
    c.once('exit', () => resolve());
    try {
      process.kill(c.pid!, 'SIGCONT');
    } catch {}
    c.kill('SIGTERM');
    setTimeout(() => c.kill('SIGKILL'), 5000).unref();
  });
}
