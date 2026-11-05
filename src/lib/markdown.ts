import path from 'node:path';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';

/**
 * Markdown ⇄ Knowledge mapping.
 *
 * Native page fields: `title` → page name, `description` → page description (≤ 100 tokens).
 * Everything else in the front matter goes in a fenced ```metadata YAML block at the top of the body.
 * Markdown links to other bundle pages become `[text]([[org:kelvara#path]])`: the inner `[[ref]]`
 * is what Knowledge indexes as a body link (wikilinks have no alias syntax), and the surrounding
 * `[text](…)` keeps the link text so export can restore a normal Markdown link.
 */
export const NATIVE_FIELDS = ['title', 'description'] as const;
export const DESCRIPTION_MAX_CHARS = 380; // ~95 tokens at Knowledge's ~4 chars/token estimate

export type ParsedDoc = { key: string; data: Record<string, unknown>; content: string };

export function parseDoc(key: string, raw: string): ParsedDoc {
  // gray-matter caches by content; pass a fresh options object to avoid cross-file cache surprises.
  const parsed = matter(raw, {});
  return { key, data: { ...parsed.data }, content: parsed.content };
}

/** `sites/elmhaven-monitoring-centre.md` → `sites/elmhaven-monitoring-centre`. */
export function keyFromFile(rel: string) {
  return rel.replace(/\\/g, '/').replace(/\.md$/, '');
}

const MD_LINK = /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const WRAPPED_WIKILINK = /\[([^\]\n]+)\]\(\[\[([^\]]+)\]\]\)/g;
const BARE_WIKILINK = /\[\[([^\]]+)\]\]/g;

/** Rewrites bundle-internal Markdown links to Knowledge refs. Returns the new body and the links seen. */
export function mdLinksToWikilinks(body: string, fromKey: string, scope: string, knownKeys: Set<string>) {
  const links: { text: string; target: string; ref?: string; style: 'absolute' | 'relative' | 'external' }[] = [];
  const out = body.replace(MD_LINK, (whole, text: string, target: string) => {
    if (/^[a-z]+:/i.test(target) || target.startsWith('#')) {
      links.push({ text, target, style: 'external' });
      return whole;
    }
    const [p] = target.split('#');
    if (!p.endsWith('.md')) return whole;
    const style = p.startsWith('/') ? 'absolute' : 'relative';
    const resolved = style === 'absolute' ? p.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(fromKey), p));
    const key = keyFromFile(resolved);
    if (!knownKeys.has(key)) {
      links.push({ text, target, style });
      return whole;
    }
    const ref = `${scope}#${key}`;
    links.push({ text, target, ref, style });
    return `[${text}]([[${ref}]])`;
  });
  return { body: out, links };
}

/** Inverse: Knowledge refs → relative Markdown links from `fromKey`. Bare `[[ref]]`s get the page name as text. */
export function wikilinksToMdLinks(body: string, fromKey: string, scope: string, nameOf: (ref: string) => string | undefined) {
  const rel = (ref: string) =>
    ref.startsWith(`${scope}#`) ? path.posix.relative(path.posix.dirname(fromKey), `${ref.slice(scope.length + 1)}.md`) : undefined;
  let out = body.replace(WRAPPED_WIKILINK, (whole, text: string, ref: string) => {
    const r = rel(ref.trim());
    return r ? `[${text}](${r})` : whole;
  });
  out = out.replace(BARE_WIKILINK, (whole, ref: string) => {
    const r = rel(ref.trim());
    if (!r) return whole;
    return `[${nameOf(ref.trim()) ?? ref.trim()}](${r})`;
  });
  return out;
}

const META_FENCE = /^```metadata\n([\s\S]*?)\n```\n?/;

export function metadataBlock(meta: Record<string, unknown>): string {
  if (!Object.keys(meta).length) return '';
  const y = yaml.dump(meta, { lineWidth: 1000, noRefs: true, sortKeys: false }).trimEnd();
  return '```metadata\n' + y + '\n```\n\n';
}

/** Splits the metadata block off a stored body. */
export function splitMetadata(body: string): { meta: Record<string, unknown>; rest: string; parseError?: string } {
  const m = body.match(META_FENCE);
  if (!m) return { meta: {}, rest: body };
  try {
    const meta = (yaml.load(m[1]) as Record<string, unknown>) ?? {};
    return { meta, rest: body.slice(m[0].length).replace(/^\n+/, '') };
  } catch (e: any) {
    return { meta: {}, rest: body, parseError: e.message };
  }
}

export function normaliseYamlValue(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString().replace('.000Z', 'Z');
  if (Array.isArray(v)) return v.map(normaliseYamlValue);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normaliseYamlValue(x)]));
  return v;
}

/** Deterministic front matter: `title`, `description` first, then the rest in stored order. */
export function frontMatter(data: Record<string, unknown>): string {
  return '---\n' + yaml.dump(normaliseYamlValue(data), { lineWidth: 1000, noRefs: true, sortKeys: false }).trimEnd() + '\n---\n';
}
