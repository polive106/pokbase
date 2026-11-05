import { existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { Mastra } from '@mastra/core/mastra';
import pg from 'pg';
import { describe, expect, it } from 'vitest';
import { config } from '../src/config.js';
import { submit } from '../src/ingest/submit.js';
import { workerLoop } from '../src/ingest/worker.js';
import { decide, listPending } from '../src/ingest/review-gate.js';
import { listScopePages } from '../src/lib/kbtree.js';
import { mockIngestModel } from '../src/lib/mock-model.js';
import { callTool } from '../src/lib/tool-call.js';
import { ensurePglite } from '../src/store.js';
import { openKb } from '../src/kb.js';
import { seed } from '../src/seed.js';
import { FIXTURE, STORE, record, testEnv, waitFor, src } from './helpers.js';


describe('T12 Review gate [observe]', () => {
  it('holds Knowledge writes for approval (requireToolApproval) and honours reject', async () => {
    const t = await testEnv('t12');
    await seed(t.knowledge, FIXTURE);
    const a = await submit(src('src-01'), { queue: t.queue, rawDir: t.rawDir });
    const b = await submit(src('src-02'), { queue: t.queue, rawDir: t.rawDir });
    const prev = config.review;
    config.review = true;
    const decisions: any[] = [];
    try {
      const run = workerLoop({ knowledge: t.knowledge, storage: t.kb.storage, queue: t.queue, worker: 't12', once: true, model: mockIngestModel(), rawDir: t.rawDir });
      const pagesWhileHeld = async () => (await listScopePages(t.knowledge, 'org:kelvara')).filter((p) => p.key.startsWith('intake-')).map((p) => p.key);
      const first = await waitFor(async () => (await listPending(t.queue))[0], 30_000, 'first pending write');
      decisions.push({ id: first.id, tool: first.tool, key: JSON.parse(first.args).key, intakePagesWhileHeld: await pagesWhileHeld(), decision: 'approved' });
      await decide(t.queue, first.id, 'approved');
      const second = await waitFor(async () => (await listPending(t.queue)).find((p) => p.id !== first.id), 30_000, 'second pending write');
      decisions.push({ id: second.id, tool: second.tool, key: JSON.parse(second.args).key, intakePagesWhileHeld: await pagesWhileHeld(), decision: 'rejected' });
      await decide(t.queue, second.id, 'rejected', 'not accurate');
      await run;
    } finally {
      config.review = prev;
    }
    const intake = (await listScopePages(t.knowledge, 'org:kelvara')).filter((p) => p.key.startsWith('intake-')).map((p) => p.key);
    const sources = await t.queue.all('SELECT substr(sha256,1,12) id, status FROM source');
    const approvedKey = `intake-${a.sha256.slice(0, 12)}`;
    const rejectedKey = `intake-${b.sha256.slice(0, 12)}`;
    record('t12', {
      status: 'OBSERVED',
      works: intake.includes(approvedKey) && !intake.includes(rejectedKey),
      mechanism: 'Agent generate() with requireToolApproval(toolName ∈ write tools) → finishReason "suspended" → pending_review row → npm run review → approveToolCallGenerate / declineToolCallGenerate',
      decisions,
      intakePagesAfter: intake,
      sourcesAfter: sources,
      onReject: 'the write never executes; the model receives the decline reason as the tool result and continues; the batch still commits (sources marked ingested) — a rejected change is not re-queued',
    });
    expect(decisions[0].intakePagesWhileHeld).toEqual([]);
    expect(intake).toContain(approvedKey);
    expect(intake).not.toContain(rejectedKey);
    await t.close();
  });
});

describe('T12b Review gate without re-passing the policy on resume [observe]', () => {
  it('records whether later writes in a resumed run are still held', async () => {
    const t = await testEnv('t12b');
    await seed(t.knowledge, FIXTURE);
    await submit(src('src-01'), { queue: t.queue, rawDir: t.rawDir });
    await submit(src('src-02'), { queue: t.queue, rawDir: t.rawDir });
    const prev = config.review;
    config.review = true;
    try {
      const run = workerLoop({ knowledge: t.knowledge, storage: t.kb.storage, queue: t.queue, worker: 't12b', once: true, model: mockIngestModel(), rawDir: t.rawDir, reapplyApprovalOnResume: false });
      const first = await waitFor(async () => (await listPending(t.queue))[0], 30_000, 'first pending write');
      await decide(t.queue, first.id, 'approved');
      await run;
    } finally {
      config.review = prev;
    }
    const held = await t.queue.all('SELECT id, decision FROM pending_review');
    const intake = (await listScopePages(t.knowledge, 'org:kelvara')).filter((p) => p.key.startsWith('intake-')).map((p) => p.key);
    record('t12b', {
      status: 'OBSERVED',
      reviewsRequested: held.length,
      writesThatLanded: intake.length,
      unreviewedWrites: intake.length - held.filter((h: any) => h.decision === 'approved').length,
      finding: 'requireToolApproval passed to generate() is not remembered by approveToolCallGenerate(): unless the policy is passed again on every resume call, writes after the first approval run without review.',
    });
    await t.close();
  });
});

describe('T13 Deletion [observe]', () => {
  it('records what remains after deleting the page holding the canary', async () => {
    const t = await testEnv('t13');
    const k = t.knowledge;
    await seed(k, FIXTURE);
    const CANARY = 'KVA-CANARY-7731';
    const sub = await submit(src('src-08'), { queue: t.queue, rawDir: t.rawDir });
    // simulate the ingest result deterministically: a page with the canary, a note on it, a note elsewhere mentioning it
    const ORG = ['org:kelvara'];
    const created = await callTool(k, ORG, 'knowledge_page', { op: 'write', scope: 'org:kelvara', parent: 'org:kelvara#sites', key: 'thornfield-door-access', name: 'Thornfield door-access system', body: `Audit reference ${CANARY}.[^c]\n\n[^c]: ${sub.sourceId}\n` }, { agentId: 'ingest' });
    const ref = 'org:kelvara#sites/thornfield-door-access';
    const noteOn = await callTool(k, ORG, 'knowledge_note', { op: 'add', page: ref, text: `Quote ${CANARY} when reporting a door-access fault (${sub.sourceId}).`, scope: ['org:kelvara'] }, { agentId: 'ingest' });
    const noteMention = await callTool(k, ORG, 'knowledge_note', { op: 'add', page: 'org:kelvara#sites/thornfield-backup-centre', text: `Door access: see [[${ref}]] (${CANARY}).`, scope: ['org:kelvara'] }, { agentId: 'ingest' });
    const before = await callTool(k, ORG, 'knowledge_search', { query: CANARY });

    // 1. agent tool delete (org scope gives editor, delete needs owner)
    const toolDelete = await callTool(k, ORG, 'knowledge_page', { op: 'delete', page: ref }, { agentId: 'ingest' });
    // 2. host delete
    const hostDeleted = await k.removePage({ scope: 'org:kelvara', path: 'sites/thornfield-door-access', author: 'process:admin' });
    const after = {
      search: await callTool(k, ORG, 'knowledge_search', { query: CANARY }),
      read: await callTool(k, ORG, 'knowledge_read', { page: ref }),
      readById: await callTool(k, ORG, 'knowledge_read', { page: created.result?.page?.id }),
      readMentioningPage: await callTool(k, ORG, 'knowledge_read', { page: 'org:kelvara#sites/thornfield-backup-centre' }),
    };
    const storage = await k.getStorage();
    const rawPage = await storage.getPage({ id: created.result.page.id, read: 'all' });
    const notesInclDeleted = await storage.listNotes({ pageId: created.result.page.id, read: 'all', includeDeleted: true } as any);
    let tableRows: Record<string, number> = {};
    if (STORE === 'libsql') {
      const db = createClient({ url: `file:${t.env.KB_DB}` });
      for (const tbl of ['mastra_knowledge_pages', 'mastra_knowledge_notes', 'mastra_knowledge_mentions', 'mastra_knowledge_page_links', 'mastra_knowledge_pins', 'mastra_knowledge_activity']) {
        const cols = (await db.execute(`PRAGMA table_info(${tbl})`)).rows.map((r) => String(r.name));
        const textCols = cols.filter((c) => /body|text|name|description|ref|payload|data|details/i.test(c));
        const where = textCols.length ? textCols.map((c) => `CAST(${c} AS TEXT) LIKE '%${CANARY}%'`).join(' OR ') : '0';
        const idCols = cols.filter((c) => /id$/i.test(c));
        const idWhere = idCols.map((c) => `${c} = '${created.result.page.id}'`).join(' OR ') || '0';
        tableRows[tbl] = Number((await db.execute(`SELECT COUNT(*) n FROM ${tbl} WHERE (${where}) OR (${idWhere})`)).rows[0].n);
      }
      db.close();
    }
    const res = (r: any) => ({ error: r.error, hits: r.result?.results?.length, hitRefs: r.result?.results?.map((h: any) => `${h.type}:${h.page?.ref}`), canaryInResult: JSON.stringify(r.result ?? {}).replaceAll(`"query":"${CANARY}"`, '').includes(CANARY) });
    record('t13', {
      status: 'OBSERVED',
      before: res(before),
      toolDelete: { refused: !!toolDelete.error, error: toolDelete.error },
      hostRemovePage: { returned: !!hostDeleted, deletedAt: hostDeleted?.deletedAt },
      after: Object.fromEntries(Object.entries(after).map(([n, r]) => [n, res(r)])),
      storeAfterDelete: { pageRowStillPresent: !!rawPage, deletedAt: rawPage?.deletedAt, bodyStillHasCanary: !!rawPage?.body?.includes(CANARY), notesOnDeletedPage: notesInclDeleted.notes.map((n: any) => ({ deleted: !!n.deletedAt, hasCanary: n.text.includes(CANARY) })) },
      rowsReferencingCanaryOrPage: tableRows,
      mentionNoteOnOtherPage: { stillVisible: JSON.stringify(after.readMentioningPage.result ?? {}).includes(CANARY) },
      rawFile: { path: path.relative(process.cwd(), sub.rawFile), stillExists: existsSync(sub.rawFile), gap: 'no source-deletion propagation: raw/ is write-once and Knowledge keeps no link from pages to raw files beyond the citation text' },
      setup: { created: created.error ?? 'ok', noteOn: noteOn.error ?? 'ok', noteMention: noteMention.error ?? 'ok' },
    });
    expect(existsSync(sub.rawFile)).toBe(true);
    await t.close();
  });
});

async function listTables(kind: string, file: string, schema?: string): Promise<string[]> {
  if (kind === 'libsql') {
    const db = createClient({ url: `file:${file}` });
    const r = await db.execute(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`);
    db.close();
    return r.rows.map((x) => String(x.name));
  }
  const c = new pg.Client({ connectionString: config.pgUrl ?? (await ensurePglite()) });
  await c.connect();
  const r = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name`, [schema ?? 'public']);
  await c.end();
  return r.rows.map((x) => x.table_name);
}

describe('T15 Migration safety [assert]', () => {
  it('an unrelated table survives Mastra start and restart', async () => {
    const t = await testEnv('t15');
    await t.close();
    const file = path.join(t.dir, 'migration.db');
    const schema = `${t.pgSchema}_m`;
    if (STORE === 'libsql') {
      const db = createClient({ url: `file:${file}` });
      await db.execute('CREATE TABLE poc_canary_table (id INTEGER PRIMARY KEY, note TEXT)');
      await db.execute(`INSERT INTO poc_canary_table (note) VALUES ('still here')`);
      db.close();
    } else {
      const c = new pg.Client({ connectionString: config.pgUrl ?? (await ensurePglite()) });
      await c.connect();
      await c.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      await c.query(`CREATE TABLE ${schema}.poc_canary_table (id SERIAL PRIMARY KEY, note TEXT)`);
      await c.query(`INSERT INTO ${schema}.poc_canary_table (note) VALUES ('still here')`);
      await c.end();
    }
    const t0 = await listTables(STORE, file, schema);
    const start = async () => {
      const kb = await openKb({ store: STORE, file, pgSchema: schema });
      new Mastra({ storage: kb.storage, knowledge: { kelvara: kb.knowledge }, logger: false });
      await (kb.storage as any).init?.(); // full Mastra storage init, as the server does at startup
      await kb.knowledge.upsertPage({ scope: 'org:kelvara', path: 'probe', name: 'Probe', body: 'x', author: 'process:t15' });
      await kb.close();
    };
    await start();
    const t1 = await listTables(STORE, file, schema);
    await start();
    const t2 = await listTables(STORE, file, schema);
    let rows: any[] = [];
    if (STORE === 'libsql') {
      const db = createClient({ url: `file:${file}` });
      rows = (await db.execute('SELECT * FROM poc_canary_table')).rows as any[];
      db.close();
    } else {
      const c = new pg.Client({ connectionString: config.pgUrl ?? (await ensurePglite()) });
      await c.connect();
      rows = (await c.query(`SELECT * FROM ${schema}.poc_canary_table`)).rows;
      await c.end();
    }
    const created = t1.filter((x) => !t0.includes(x));
    const dropped = [...t0.filter((x) => !t1.includes(x)), ...t1.filter((x) => !t2.includes(x))];
    record('t15', { status: rows.length === 1 && t2.includes('poc_canary_table') ? 'PASS' : 'FAIL', canaryRows: rows.length, created, createdOnRestart: t2.filter((x) => !t1.includes(x)), dropped, knowledgeTables: t2.filter((x) => x.includes('knowledge')) });
    expect(t2).toContain('poc_canary_table');
    expect(rows).toHaveLength(1);
    expect(dropped).toEqual([]);
  });
});
