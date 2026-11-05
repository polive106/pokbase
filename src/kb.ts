import { config, type StoreKind } from './config.js';
import { createKnowledge } from './knowledge.js';
import { createStorage } from './store.js';

/** Opens the Knowledge store outside the Mastra server (CLIs, worker, tests). */
export async function openKb(opts: { store?: StoreKind; file?: string; pgSchema?: string } = {}) {
  const storage = await createStorage(opts.store ?? config.store, { file: opts.file, pgSchema: opts.pgSchema });
  const knowledge = createKnowledge(storage);
  await (await knowledge.getStorage()).init?.();
  return {
    storage,
    knowledge,
    async close() {
      await (storage as any).close?.();
    },
  };
}
