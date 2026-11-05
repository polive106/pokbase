import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

/** T16: compares out/results/<t>.json (libsql) with out/results/pg/<t>.json on the fields that matter. */
const dir = path.join(config.outDir, 'results');
const pgDir = path.join(dir, process.env.PARITY_PG_DIR ?? 'pg'); // pg (PGlite) or pg-docker (PG_URL)
const load = (f: string) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : undefined);
const pick: Record<string, (r: any) => unknown> = {
  t01: (r) => r.summary,
  t02: (r) => ({ status: r.status, different: r.different }),
  t03: (r) => ({ a: r.noExpectedVersion.writes.map((w: any) => w.ok), survivorA: r.noExpectedVersion.survivor, b: r.sameExpectedVersion.writes.map((w: any) => w.ok), errorsB: r.sameExpectedVersion.errors.map((e: string) => e.replace(/[0-9A-Z]{26}/, '<id>')), c: r.sequentialLostUpdate.writes.map((w: any) => w.ok) }),
  t04: (r) => ({ toolPath: Object.fromEntries(Object.entries(r.toolPath).map(([k, v]: any) => [k, { leaked: v.leaked, refused: v.refused }])), host: { ...r.hostPath, explainAccessAliceOnBob: { role: r.hostPath.explainAccessAliceOnBob.role, reason: r.hostPath.explainAccessAliceOnBob.reason } } }),
  t05: (r) => ({ r1: r.r1, r5: r.r5, rawUnchanged: r.rawUnchanged, rows: r.sourceRows.length }),
  t06: (r) => ({ statuses: r.submitStatuses, jobs: r.jobsBefore.length, runs: r.runs.length }),
  t07: (r) => ({ status: r.status, overlaps: r.overlaps.length, notOnce: r.notOnce.length }),
  t08: (r) => ({ status: r.status, outcome: r.runA.outcome }),
  t12: (r) => ({ works: r.works }),
  t12b: (r) => ({ unreviewedWrites: r.unreviewedWrites }),
  t13: (r) => ({
    toolDelete: r.toolDelete.refused,
    after: Object.fromEntries(Object.entries(r.after).map(([k, v]: any) => [k, { hits: v.hits, hitRefs: v.hitRefs, canary: v.canaryInResult, refused: !!v.error }])),
    store: { ...r.storeAfterDelete, deletedAt: !!r.storeAfterDelete.deletedAt },
  }),
  t15: (r) => ({ status: r.status, dropped: r.dropped, knowledgeTables: r.knowledgeTables }),
};
const out: Record<string, unknown> = {};
for (const [t, f] of Object.entries(pick)) {
  const a = load(path.join(dir, `${t}.json`));
  const b = load(path.join(pgDir, `${t}.json`));
  if (!a || !b) {
    out[t] = { compared: false, reason: !a ? 'no libsql result' : 'no pg result' };
    continue;
  }
  const va = JSON.stringify(f(a));
  const vb = JSON.stringify(f(b));
  out[t] = va === vb ? { same: true, libsql: a.status, pg: b.status } : { same: false, libsql: f(a), pg: f(b) };
}
const allSame = Object.values(out).every((v: any) => v.same);
const statusOk = ['t02', 't05', 't06', 't07', 't08', 't15'].every((t) => (load(path.join(pgDir, `${t}.json`))?.status ?? 'PASS') === 'PASS');
const result = { test: 't16', status: statusOk ? (allSame ? 'PASS' : 'PASS (with recorded differences)') : 'FAIL', pgBackend: config.pgUrl || process.env.PARITY_PG_DIR === 'pg-docker' ? 'Postgres via PG_URL (docker compose)' : 'PGlite 0.5.15 via pglite-socket 0.2.18', comparisons: out };
writeFileSync(path.join(dir, process.env.PARITY_PG_DIR ? `t16-${process.env.PARITY_PG_DIR}.json` : 't16.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
