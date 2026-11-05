import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Knowledge } from '@mastra/core/knowledge';
import { config } from './config.js';
import { DESCRIPTION_MAX_CHARS, NATIVE_FIELDS, keyFromFile, mdLinksToWikilinks, metadataBlock, normaliseYamlValue, parseDoc } from './lib/markdown.js';
import { isMain } from './lib/cli.js';

const RESERVED = new Set(['index.md', 'log.md']);

export type SeedReport = {
  dir: string;
  scope: string;
  author: string;
  pages: Array<{
    file: string;
    ref: string;
    status: 'created' | 'updated' | 'unchanged';
    descriptionTruncated: boolean;
    notNativelyStored: string[];
    links: { rewritten: number; unresolved: string[]; external: number };
  }>;
  skipped: string[];
  notNativelyStored: Record<string, string>;
};

export function listMarkdown(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.md')) out.push(path.relative(dir, p).replace(/\\/g, '/'));
    }
  };
  walk(dir);
  return out;
}

/** Loads a Markdown bundle through `upsertPage` (author `process:seed`). Idempotent: unchanged pages are not written. */
export async function seed(knowledge: Knowledge, dir: string, opts: { scope?: string; author?: string } = {}): Promise<SeedReport> {
  const scope = opts.scope ?? config.kb;
  const author = opts.author ?? 'process:seed';
  const files = listMarkdown(dir);
  const skipped = files.filter((f) => RESERVED.has(f));
  const docs = files.filter((f) => !RESERVED.has(f)).map((f) => parseDoc(keyFromFile(f), readFileSync(path.join(dir, f), 'utf8')));
  const known = new Set(docs.map((d) => d.key));
  const report: SeedReport = { dir, scope, author, pages: [], skipped, notNativelyStored: {} };

  // Parents first, so "folder" pages created implicitly by upsertPage exist before their children.
  for (const doc of docs.sort((a, b) => a.key.split('/').length - b.key.split('/').length || (a.key < b.key ? -1 : 1))) {
    const data = doc.data;
    const meta = Object.fromEntries(Object.entries(data).filter(([k]) => !(NATIVE_FIELDS as readonly string[]).includes(k)));
    for (const k of Object.keys(meta)) report.notNativelyStored[k] = 'relocated to the ```metadata block at the top of the body';
    let description = typeof data.description === 'string' ? data.description : undefined;
    let truncated = false;
    if (description && description.length > DESCRIPTION_MAX_CHARS) {
      description = description.slice(0, DESCRIPTION_MAX_CHARS - 1) + '…';
      truncated = true;
    }
    const { body: linked, links } = mdLinksToWikilinks(doc.content.replace(/^\n+/, ''), doc.key, scope, known);
    const body = metadataBlock(normaliseYamlValue(meta) as Record<string, unknown>) + linked;
    const res = await knowledge.upsertPage({ scope, path: doc.key, name: String(data.title ?? doc.key), description, body, author });
    report.pages.push({
      file: `${doc.key}.md`,
      ref: `${scope}#${doc.key}`,
      status: res.status,
      descriptionTruncated: truncated,
      notNativelyStored: Object.keys(meta),
      links: {
        rewritten: links.filter((l) => l.ref).length,
        unresolved: links.filter((l) => !l.ref && l.style !== 'external').map((l) => l.target),
        external: links.filter((l) => l.style === 'external').length,
      },
    });
  }
  report.pages.sort((a, b) => (a.file < b.file ? -1 : 1));
  return report;
}

if (isMain(import.meta.url)) {
  const dir = path.resolve(process.argv[2] ?? 'fixtures/kelvara-handbook');
  const { openKb } = await import('./kb.js');
  const kb = await openKb();
  const report = await seed(kb.knowledge, dir);
  mkdirSync(config.outDir, { recursive: true });
  writeFileSync(path.join(config.outDir, 'seed-report.json'), JSON.stringify(report, null, 2) + '\n');
  const counts = report.pages.reduce<Record<string, number>>((a, p) => ((a[p.status] = (a[p.status] ?? 0) + 1), a), {});
  console.log(`seeded ${report.pages.length} pages into ${report.scope} (${config.store}):`, counts, `→ ${path.join(config.outDir, 'seed-report.json')}`);
  await kb.close();
}
