import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportKb } from '../src/export.js';
import { listMarkdown, seed } from '../src/seed.js';
import { comparePage } from './lib-compare.js';
import { FIXTURE, ROOT, STORE, record, testEnv } from './helpers.js';

describe('T1 Markdown round trip [observe]', () => {
  it('seeds, exports and compares with the fixture', async () => {
    const t = await testEnv('t01');
    const report = await seed(t.knowledge, FIXTURE);
    const again = await seed(t.knowledge, FIXTURE);
    const outDir = path.join(ROOT, 'out/test-exports', `${STORE}-t01`);
    const exp = await exportKb(t.knowledge, outDir);
    const pages = listMarkdown(FIXTURE)
      .filter((f) => f !== 'index.md' && f !== 'log.md')
      .map((f) => comparePage(f.replace(/\.md$/, ''), path.join(FIXTURE, f), path.join(outDir, f)));
    const summary = {
      pages: pages.length,
      frontMatterLost: pages.flatMap((p) => Object.entries(p.frontMatter).filter(([, v]) => v === 'lost' || v.startsWith('changed')).map(([k, v]) => `${p.key}.${k}: ${v}`)),
      linksPreserved: pages.every((p) => p.links.sameTargetsAndText),
      linkStyleNormalised: pages.reduce((n, p) => n + p.links.styleChanged, 0),
      footnotesIntact: pages.every((p) => p.footnotes.intact),
      bodiesByteIdentical: pages.filter((p) => p.diff.byteIdenticalBody).length,
      reseedStatuses: [...new Set(again.pages.map((p) => p.status))],
      exportProblems: exp.problems,
    };
    record('t01', { status: 'OBSERVED', summary, seedReport: { notNativelyStored: report.notNativelyStored, truncated: report.pages.filter((p) => p.descriptionTruncated).map((p) => p.ref) }, pages });
    expect(again.pages.every((p) => p.status === 'unchanged')).toBe(true); // seed idempotency
    await t.close();
  });
});

describe('T2 Deterministic seed and export [assert]', () => {
  it('two fresh databases export byte-identical files', async () => {
    const a = await testEnv('t02a');
    const b = await testEnv('t02b');
    await seed(a.knowledge, FIXTURE);
    await seed(b.knowledge, FIXTURE);
    const da = path.join(ROOT, 'out/test-exports', `${STORE}-t02a`);
    const db = path.join(ROOT, 'out/test-exports', `${STORE}-t02b`);
    const ea = await exportKb(a.knowledge, da);
    const eb = await exportKb(b.knowledge, db);
    const files = [...new Set([...listMarkdown(da), ...listMarkdown(db)])];
    const different = files.filter((f) => {
      try {
        return readFileSync(path.join(da, f), 'utf8') !== readFileSync(path.join(db, f), 'utf8');
      } catch {
        return true;
      }
    });
    // and exporting the same database twice is identical too
    const da2 = da + '-again';
    await exportKb(a.knowledge, da2);
    const notRepeatable = listMarkdown(da).filter((f) => readFileSync(path.join(da, f), 'utf8') !== readFileSync(path.join(da2, f), 'utf8'));
    record('t02', { status: different.length || notRepeatable.length ? 'FAIL' : 'PASS', files: files.length, different, notRepeatable, pagesA: ea.files.length, pagesB: eb.files.length });
    expect(different).toEqual([]);
    expect(notRepeatable).toEqual([]);
    expect(files.length).toBeGreaterThan(12);
    await a.close();
    await b.close();
  });
});
