import { mkdirSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { LibSQLStore } from '@mastra/libsql';
import { PostgresStore } from '@mastra/pg';
import type { MastraCompositeStore } from '@mastra/core/storage';
import { config, type StoreKind } from './config.js';

/**
 * Storage for Knowledge (and the rest of Mastra). STORE=libsql → a file under ./data;
 * STORE=pg → PG_URL if set, else a PGlite database served over a local Postgres socket.
 */
export async function createStorage(kind: StoreKind = config.store, opts: { file?: string; pgSchema?: string } = {}): Promise<MastraCompositeStore> {
  if (kind === 'pg') {
    const url = config.pgUrl ?? (await ensurePglite());
    const schemaName = opts.pgSchema ?? process.env.KB_PG_SCHEMA;
    return new PostgresStore({ id: 'kb-pg', connectionString: url, max: config.pgUrl ? 10 : 1, ...(schemaName ? { schemaName } : {}) } as any);
  }
  const file = opts.file ?? config.kbDbFile;
  assertUnderData(file);
  mkdirSync(path.dirname(file), { recursive: true });
  return new LibSQLStore({ id: 'kb-libsql', url: `file:${file}` });
}

/** Ground rule 4: only ./data databases. */
export function assertUnderData(file: string) {
  const rel = path.relative(path.join(config.root, 'data'), file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Refusing to open a database outside ./data: ${file}`);
}

let pgliteStop: (() => Promise<void>) | undefined;

/**
 * Connects to the PGlite socket server on PGLITE_PORT, starting one in this process if none is
 * listening. Other processes (workers) then connect to it.
 */
export async function ensurePglite(): Promise<string> {
  const url = `postgres://postgres:postgres@127.0.0.1:${config.pglitePort}/postgres?sslmode=disable`;
  if (await portOpen(config.pglitePort)) return url;
  await startPgliteServer();
  return url;
}

export async function startPgliteServer() {
  const { PGlite } = await import('@electric-sql/pglite');
  const { PGLiteSocketServer } = await import('@electric-sql/pglite-socket');
  assertUnderData(path.join(config.pgliteDir, 'x'));
  mkdirSync(config.pgliteDir, { recursive: true });
  const db = await PGlite.create(config.pgliteDir);
  const server = new PGLiteSocketServer({ db, port: config.pglitePort, host: '127.0.0.1', maxConnections: 20 } as any);
  await server.start();
  pgliteStop = async () => {
    await server.stop();
    await db.close();
  };
  return pgliteStop;
}

export async function stopPglite() {
  await pgliteStop?.();
  pgliteStop = undefined;
}

function portOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.once('error', () => resolve(false));
  });
}
