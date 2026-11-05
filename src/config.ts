import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

/** Project root: POC_ROOT, else the nearest ancestor of cwd holding src/ingest/instructions.md (mastra dev runs from .mastra/output). */
function findRoot(): string {
  if (process.env.POC_ROOT) return process.env.POC_ROOT;
  let dir = process.cwd();
  for (;;) {
    if (existsSync(path.join(dir, 'src/ingest/instructions.md'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return process.cwd();
    dir = up;
  }
}

/**
 * Runtime configuration. Everything is overridable from the environment so tests can point a
 * process at its own throwaway directory under ./data.
 */
const root = findRoot();
dotenv.config({ path: path.join(root, '.env'), quiet: true } as any);
const abs = (p: string) => (path.isAbsolute(p) ? p : path.join(root, p));

export type StoreKind = 'libsql' | 'pg';

export const config = {
  root,
  store: (process.env.STORE ?? 'libsql') as StoreKind,
  // Paths are getters so a test or child process that sets the env sees them (no stale snapshot).
  get dataDir() {
    return abs(process.env.DATA_DIR ?? 'data');
  },
  get kbDbFile() {
    return abs(process.env.KB_DB ?? path.join(this.dataDir, 'knowledge-test.db'));
  },
  get queueDbFile() {
    return abs(process.env.QUEUE_DB ?? path.join(this.dataDir, 'queue.db'));
  },
  get rawDir() {
    return abs(process.env.RAW_DIR ?? 'raw');
  },
  get dropDir() {
    return abs(process.env.DROP_DIR ?? 'drop');
  },
  get outDir() {
    return abs(process.env.OUT_DIR ?? 'out');
  },
  /** Where test results go: out/results, out/results/pg (PGlite) or out/results/pg-docker (PG_URL). */
  get resultsDir() {
    return path.join(this.outDir, 'results', this.store === 'pg' ? (this.pgUrl ? 'pg-docker' : 'pg') : '');
  },
  get runLogDir() {
    return abs(process.env.RUN_LOG_DIR ?? path.join(this.outDir, 'ingest-runs'));
  },
  /** Real Postgres (e.g. docker compose). When unset, STORE=pg uses PGlite over a local socket. */
  pgUrl: process.env.PG_URL,
  pglitePort: Number(process.env.PGLITE_PORT ?? 55432),
  get pgliteDir() {
    return abs(process.env.PGLITE_DIR ?? path.join(this.dataDir, 'pglite'));
  },
  kb: 'org:kelvara',
  orgScope: 'org:kelvara',
  users: ['alice', 'bob'] as const,
  batchCap: Number(process.env.BATCH_CAP ?? 5),
  leaseTtlMs: Number(process.env.LEASE_TTL_MS ?? 30_000),
  pollMs: Number(process.env.POLL_MS ?? 500),
  maxAttempts: 3,
  review: process.env.REVIEW === 'on',
  /** `mock` (default without a key) or a Mastra model-router id such as `anthropic/claude-sonnet-5-5`. */
  get model() {
    return process.env.MODEL ?? (hasProviderKey() ? defaultModelForKey() : 'mock');
  },
  mockStepDelayMs: Number(process.env.MOCK_STEP_DELAY_MS ?? 0),
};

const PROVIDER_KEYS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  groq: 'GROQ_API_KEY',
};

function hasProviderKey() {
  return Object.values(PROVIDER_KEYS).some((k) => !!process.env[k]);
}

function defaultModelForKey() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic/claude-sonnet-5-5';
  if (process.env.OPENAI_API_KEY) return 'openai/gpt-6.1-sol';
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return 'google/gemini-3-pro';
  return 'mock';
}

/** True when a real LLM is configured and its provider key is present. */
export function hasRealModel(): boolean {
  const m = config.model;
  if (m === 'mock') return false;
  const provider = m.split('/')[0];
  const key = PROVIDER_KEYS[provider];
  return key ? !!process.env[key] : true;
}
