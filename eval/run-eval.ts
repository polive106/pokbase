import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { createReaderAgent } from '../src/agents.js';
import { config, hasRealModel } from '../src/config.js';
import { openKb } from '../src/kb.js';
import { callTool } from '../src/lib/tool-call.js';
import { scopesForUser } from '../src/scopes.js';

/**
 * npm run eval -- --label seed        (after npm run seed)
 * npm run eval -- --label ingested    (after ingesting fixtures/sources)
 * Retrieval-only (keyword knowledge_search, recall@5) always; reader-agent answers when a real model is set.
 */
type Q = { id: string; question: string; expected_pages: string[]; expected_answer: string; kind: string; phase: string; expected_text?: string };
const argv = process.argv.slice(2);
const label = argv[argv.indexOf('--label') + 1] && argv.includes('--label') ? argv[argv.indexOf('--label') + 1] : 'current';
const questions: Q[] = JSON.parse(readFileSync(path.join(config.root, 'eval/questions.json'), 'utf8'));
const kb = await openKb();
const scopes = scopesForUser('alice');
const ABSTAIN = /don'?t know|do not know|not (?:in|find|found|contain|mention)|no (?:information|record|mention)|cannot find|couldn'?t find|je ne sais pas|pas d'information|aucune information|ne (?:contient|mentionne|précise|indique) pas|ne trouve pas|introuvable/i;

const rows: any[] = [];
const reader = hasRealModel() ? createReaderAgent(kb.knowledge) : undefined;
for (const q of questions) {
  const t0 = Date.now();
  const r = await callTool(kb.knowledge, scopes, 'knowledge_search', { query: q.question, limit: 5 });
  const hits: any[] = r.result?.results ?? [];
  const refs = [...new Set(hits.map((h) => h.page?.ref).filter(Boolean))].slice(0, 5);
  const found = q.expected_pages.filter((p) => refs.includes(p));
  const textHit = q.expected_text ? JSON.stringify(hits).includes(q.expected_text) : undefined;
  const row: any = {
    id: q.id, kind: q.kind, phase: q.phase,
    retrieval: {
      top5: refs,
      recallAt5: q.expected_pages.length ? found.length / q.expected_pages.length : q.expected_text ? (textHit ? 1 : 0) : null,
      hitsForUnanswerable: q.kind === 'unanswerable' ? hits.length : undefined,
      ms: Date.now() - t0,
      error: r.error,
    },
  };
  if (reader) {
    const t1 = Date.now();
    try {
      const res: any = await reader.generate(q.question, { scopes, maxSteps: 12 } as any);
      const text: string = res.text ?? '';
      row.llm = {
        answer: text,
        citedPages: [...new Set(text.match(/org:kelvara#[a-z0-9/_-]+/gi) ?? [])],
        reportedBothSides: q.kind === 'contradiction' ? /14\s*(mars|March)/i.test(text) && /28\s*(mars|March)/i.test(text) : undefined,
        usedNewValue: q.kind === 'superseded' ? (q.phase === 'ingested' ? /45/.test(text) : /30/.test(text)) : undefined,
        abstained: ABSTAIN.test(text),
        correctAbstention: q.kind === 'unanswerable' ? ABSTAIN.test(text) : undefined,
        latencyMs: Date.now() - t1,
        tokens: res.usage?.totalTokens,
      };
    } catch (e: any) {
      row.llm = { error: e.message };
    }
  }
  rows.push(row);
}
await kb.close();

const groups = (key: 'kind' | 'phase') => {
  const out: Record<string, any> = {};
  for (const r of rows) {
    const g = (out[r[key]] ??= { n: 0, recallSum: 0, recallN: 0, abstainOk: 0, abstainN: 0, both: 0, bothN: 0 });
    g.n++;
    if (r.retrieval.recallAt5 !== null) { g.recallSum += r.retrieval.recallAt5; g.recallN++; }
    if (r.llm?.correctAbstention !== undefined) { g.abstainN++; g.abstainOk += r.llm.correctAbstention ? 1 : 0; }
    if (r.llm?.reportedBothSides !== undefined) { g.bothN++; g.both += r.llm.reportedBothSides ? 1 : 0; }
  }
  return Object.fromEntries(Object.entries(out).map(([k, g]) => [k, { n: g.n, recallAt5: g.recallN ? +(g.recallSum / g.recallN).toFixed(2) : null, ...(g.abstainN ? { abstention: `${g.abstainOk}/${g.abstainN}` } : {}), ...(g.bothN ? { bothSides: `${g.both}/${g.bothN}` } : {}) }]));
};
const result = { label, store: config.store, mode: 'keyword', hybrid: 'not run: no vector store / embedder configured', model: reader ? config.model : 'none (retrieval only)', at: new Date().toISOString(), byKind: groups('kind'), byPhase: groups('phase'), rows };

mkdirSync(path.join(config.outDir), { recursive: true });
const file = path.join(config.outDir, 'eval-results.json');
const all = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
all[label] = result;
writeFileSync(file, JSON.stringify(all, null, 2) + '\n');

// Markdown summary
const table = (label: string, r: any) => {
  const lines = [`**${label}** (${r.store}, ${r.mode}, LLM: ${r.model})`, '', '| Group | n | recall@5 | abstention | both sides |', '| --- | --- | --- | --- | --- |'];
  for (const [k, g] of Object.entries<any>({ ...r.byPhase, ...r.byKind })) lines.push(`| ${k} | ${g.n} | ${g.recallAt5 ?? '–'} | ${g.abstention ?? '–'} | ${g.bothSides ?? '–'} |`);
  return lines.join('\n');
};
const md = Object.entries<any>(all).map(([l, r]) => table(l, r)).join('\n\n');
writeFileSync(path.join(config.outDir, 'eval-summary.md'), md + '\n');
const findings = path.join(config.root, 'FINDINGS.md');
if (existsSync(findings)) {
  const f = readFileSync(findings, 'utf8');
  const s = f.indexOf('<!-- eval:start -->');
  const e = f.indexOf('<!-- eval:end -->');
  if (s >= 0 && e > s) writeFileSync(findings, f.slice(0, s + '<!-- eval:start -->'.length) + '\n' + md + '\n' + f.slice(e));
}
console.log(md);
process.exit(0);
