import { rmSync } from 'node:fs';
import path from 'node:path';

/** STORE=pg without PG_URL: one PGlite server for the whole run, reachable by spawned workers. */
export default async function setup() {
  if (process.env.STORE !== 'pg' || process.env.PG_URL) return;
  process.env.PGLITE_DIR ??= path.join(process.cwd(), 'data/tests/pglite');
  rmSync(process.env.PGLITE_DIR, { recursive: true, force: true });
  const { startPgliteServer } = await import('../src/store.js');
  const stop = await startPgliteServer();
  return async () => {
    await stop();
  };
}
