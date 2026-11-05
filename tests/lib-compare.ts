import { readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { normaliseYamlValue } from '../src/lib/markdown.js';

const LINK = /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g;

export function linkTargets(key: string, body: string) {
  return [...body.matchAll(LINK)]
    .map((m) => ({ text: m[1], target: m[2] }))
    .filter((l) => l.target.endsWith('.md'))
    .map((l) => ({
      ...l,
      key: (l.target.startsWith('/') ? l.target.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(key), l.target))).replace(/\.md$/, ''),
      style: l.target.startsWith('/') ? 'absolute' : 'relative',
    }));
}

export function footnotes(body: string) {
  const defs = [...body.matchAll(/^\[\^([^\]]+)\]:/gm)].map((m) => m[1]).sort();
  const refs = [...new Set([...body.matchAll(/\[\^([^\]]+)\](?!:)/g)].map((m) => m[1]))].sort();
  return { defs, refs };
}

/** Compares one fixture page with its exported counterpart. */
export function comparePage(key: string, fixtureFile: string, exportFile: string) {
  const a = matter(readFileSync(fixtureFile, 'utf8'), {});
  const b = matter(readFileSync(exportFile, 'utf8'), {});
  const fa = normaliseYamlValue(a.data) as Record<string, unknown>;
  const fb = normaliseYamlValue(b.data) as Record<string, unknown>;
  const frontMatter: Record<string, string> = {};
  for (const [k, v] of Object.entries(fa)) {
    const native = k === 'title' || k === 'description';
    if (!(k in fb)) frontMatter[k] = 'lost';
    else if (JSON.stringify(fb[k]) !== JSON.stringify(v)) frontMatter[k] = `changed (${JSON.stringify(v)} → ${JSON.stringify(fb[k])})`;
    else frontMatter[k] = native ? 'kept (native field)' : 'relocated (metadata block, restored on export)';
  }
  const la = linkTargets(key, a.content);
  const lb = linkTargets(key, b.content);
  const keysA = la.map((l) => `${l.text}→${l.key}`).sort();
  const keysB = lb.map((l) => `${l.text}→${l.key}`).sort();
  const na = footnotes(a.content);
  const nb = footnotes(b.content);
  const linesA = a.content.trim().split('\n');
  const linesB = b.content.trim().split('\n');
  const setB = new Set(linesB);
  const setA = new Set(linesA);
  return {
    key,
    frontMatter,
    links: {
      count: la.length,
      sameTargetsAndText: JSON.stringify(keysA) === JSON.stringify(keysB),
      styleChanged: la.filter((l, i) => l.style !== lb[i]?.style).length,
      missing: keysA.filter((k) => !keysB.includes(k)),
    },
    footnotes: { intact: JSON.stringify(na) === JSON.stringify(nb), fixture: na, export: nb },
    diff: {
      linesRemoved: linesA.filter((l) => !setB.has(l)).length,
      linesAdded: linesB.filter((l) => !setA.has(l)).length,
      byteIdenticalBody: a.content.trim() === b.content.trim(),
      examples: linesA.filter((l) => !setB.has(l)).slice(0, 3).map((l, i) => ({ before: l, after: linesB.filter((x) => !setA.has(x))[i] })),
    },
  };
}
