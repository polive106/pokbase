import type { Knowledge } from '@mastra/core/knowledge';

export type TreePage = {
  id: string;
  key: string; // key path below the scope, e.g. sites/elmhaven-monitoring-centre
  name: string;
  description?: string;
  body?: string;
  version: number;
  updatedBy: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  childCount: number;
};

/** Every live page under a scope (host view, `read: 'all'`), depth first, sorted by key path. */
export async function listScopePages(knowledge: Knowledge, scopeAddress: string): Promise<TreePage[]> {
  const storage = await knowledge.getStorage();
  const [scope] = await storage.getScopesByAddress([scopeAddress]);
  if (!scope) return [];
  const out: TreePage[] = [];
  // Returns the number of direct children, so each page's childCount comes from its own walk.
  const walk = async (parentId: string, prefix: string): Promise<number> => {
    let cursor: string | undefined;
    const children: any[] = [];
    do {
      const res: any = await storage.listChildPages({ parentId, read: 'all', cursor, limit: 100 });
      children.push(...(res.pages ?? res.items ?? []));
      cursor = res.nextCursor;
    } while (cursor);
    for (const p of children) {
      const key = prefix ? `${prefix}/${p.key ?? p.id}` : (p.key ?? p.id);
      const idx = out.length;
      out.push({
        id: p.id,
        key,
        name: p.name,
        description: p.description,
        body: p.body,
        version: p.version,
        updatedBy: p.updatedBy?.author,
        createdBy: p.createdBy?.author,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        childCount: 0,
      });
      out[idx].childCount = await walk(p.id, key);
    }
    return children.length;
  };
  await walk(scope.id, '');
  return out.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

export async function listAllNotes(knowledge: Knowledge, pageId: string) {
  const storage = await knowledge.getStorage();
  const notes: any[] = [];
  let cursor: string | undefined;
  do {
    const res: any = await storage.listNotes({ pageId, read: 'all', cursor, limit: 100 });
    notes.push(...(res.notes ?? res.items ?? []));
    cursor = res.nextCursor;
  } while (cursor);
  return notes;
}
