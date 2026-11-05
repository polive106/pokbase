import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import pg from 'pg';
import { config } from './config.js';
import { isMain } from './lib/cli.js';
import { ensurePglite } from './store.js';

/** Dumps every mastra_knowledge_* table (plus the queue tables) to JSON, for diffing between runs. */
export async function dumpKnowledgeTables(): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  if (config.store === 'libsql') {
    const db = createClient({ url: `file:${config.kbDbFile}` });
    const tables = (await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'mastra_knowledge%' ORDER BY name`)).rows.map((r) => String(r.name));
    for (const t of tables) out[t] = (await db.execute(`SELECT * FROM "${t}" ORDER BY 1`)).rows.map((r) => ({ ...r }));
    db.close();
  } else {
    const c = new pg.Client({ connectionString: config.pgUrl ?? (await ensurePglite()) });
    await c.connect();
    const schema = process.env.KB_PG_SCHEMA ?? 'public';
    const tables = (await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema=$1 AND table_name LIKE 'mastra_knowledge%' ORDER BY table_name`, [schema])).rows.map((r) => r.table_name);
    for (const t of tables) out[t] = (await c.query(`SELECT * FROM "${schema}"."${t}" ORDER BY 1`)).rows;
    await c.end();
  }
  const q = createClient({ url: `file:${config.queueDbFile}` });
  for (const t of ['source', 'job', 'kb_lease', 'ingest_run', 'pending_review']) {
    try {
      out[`queue.${t}`] = (await q.execute(`SELECT * FROM ${t} ORDER BY rowid`)).rows.map((r) => ({ ...r }));
    } catch {}
  }
  q.close();
  return out;
}

if (isMain(import.meta.url)) {
  const dump = await dumpKnowledgeTables();
  mkdirSync(config.outDir, { recursive: true });
  const file = path.join(config.outDir, 'db-dump.json');
  writeFileSync(file, JSON.stringify(dump, (_k, v) => (typeof v === 'bigint' ? Number(v) : v), 2) + '\n');
  for (const [t, rows] of Object.entries(dump)) console.log(`${t.padEnd(36)} ${rows.length}`);
  console.log(`→ ${file}`);
  process.exit(0);
}
