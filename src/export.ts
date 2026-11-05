import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Knowledge } from '@mastra/core/knowledge';
import { config } from './config.js';
import { listAllNotes, listScopePages } from './lib/kbtree.js';
import { frontMatter, splitMetadata, wikilinksToMdLinks } from './lib/markdown.js';
import { isMain } from './lib/cli.js';

/**
 * Writes the scope's pages back to Markdown, one file per page. Deterministic: output depends only
 * on stored content (no versions, ids or timestamps except note dates, which are stored content).
 */
export async function exportKb(knowledge: Knowledge, outDir: string, opts: { scope?: string } = {}) {
  const scope = opts.scope ?? config.kb;
  const pages = await listScopePages(knowledge, scope);
  const nameByRef = new Map(pages.map((p) => [`${scope}#${p.key}`, p.name]));
  const pageByKey = new Map(pages.map((p) => [p.key, p]));
  const notesByPage = new Map(await Promise.all(pages.map(async (p) => [p.id, await listAllNotes(knowledge, p.id)] as const)));
  const rel = path.relative(config.root, path.resolve(outDir));
  if (rel.startsWith('..') || !rel) throw new Error(`refusing to clear ${outDir}: export only inside the project`);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const files: string[] = [];
  const problems: string[] = [];

  for (const p of pages) {
    const body = p.body ?? '';
    if (!body.trim() && p.childCount > 0) continue; // folder page: represented by its index.md
    const { meta, rest, parseError } = splitMetadata(body);
    if (parseError) problems.push(`${p.key}: metadata block is not valid YAML (${parseError})`);
    const data: Record<string, unknown> = { title: p.name, ...(p.description ? { description: p.description } : {}), ...meta };
    let md = frontMatter(data) + '\n' + wikilinksToMdLinks(rest, p.key, scope, (ref) => nameByRef.get(ref)).replace(/\s+$/, '') + '\n';
    const notes = notesByPage.get(p.id)!.filter((n) => !n.deletedAt);
    if (notes.length) {
      notes.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt) || (a.id < b.id ? -1 : 1));
      md += '\n## Notes\n\n';
      for (const n of notes) {
        const when = n.when ? ` (applies ${new Date(n.when).toISOString().slice(0, 10)})` : '';
        const text = wikilinksToMdLinks(n.text, p.key, scope, (ref) => nameByRef.get(ref)).replace(/\n+/g, ' ');
        md += `- ${text} — *${n.provenance?.author ?? 'unknown'}, ${new Date(n.createdAt).toISOString().slice(0, 10)}*${when}\n`;
      }
    }
    const file = path.join(outDir, `${p.key}.md`);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, md);
    files.push(`${p.key}.md`);
  }

  // index.md per folder, from descriptions.
  const folders = new Set<string>(['']);
  for (const f of files) {
    const parts = f.split('/');
    for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/'));
  }
  for (const folder of [...folders].sort()) {
    const depth = folder ? folder.split('/').length : 0;
    const childFiles = files.filter((f) => f.split('/').length === depth + 1 && (folder ? f.startsWith(folder + '/') : true));
    const childFolders = [...folders].filter((d) => d && d.split('/').length === depth + 1 && (folder ? d.startsWith(folder + '/') : true));
    const title = folder ? (pageByKey.get(folder)?.name ?? folder) : 'Kelvara Health handbook';
    let md = `# ${title}\n\n`;
    for (const d of childFolders) md += `- [${path.posix.basename(d)}/](${path.posix.basename(d)}/index.md)\n`;
    for (const f of childFiles) {
      const p = pageByKey.get(f.replace(/\.md$/, ''))!;
      md += `- [${p.name}](${path.posix.basename(f)})${p.description ? ` — ${p.description}` : ''}\n`;
    }
    writeFileSync(path.join(outDir, folder, 'index.md'), md);
  }
  return { scope, files, problems };
}

if (isMain(import.meta.url)) {
  const outDir = path.resolve(process.argv[2] ?? path.join(config.outDir, 'export'));
  const { openKb } = await import('./kb.js');
  const kb = await openKb();
  const res = await exportKb(kb.knowledge, outDir);
  console.log(`exported ${res.files.length} pages from ${res.scope} → ${outDir}`);
  for (const p of res.problems) console.warn('warning:', p);
  await kb.close();
}
