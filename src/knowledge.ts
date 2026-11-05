import { Knowledge, knowledgeMemoryScopes } from '@mastra/core/knowledge';
import type { MastraCompositeStore } from '@mastra/core/storage';

/**
 * Scope declarations. `knowledgeMemoryScopes()` declares:
 *  - `org:$orgId`        self → editor (append + edit, NOT delete: delete needs owner)
 *  - `resource:$resourceId` self → owner, placed under the org
 *  - `thread:$threadId`  self → owner, placed under the resource
 * So a run holding `org:kelvara` + `resource:alice` reads the org and Alice's private scope,
 * never `resource:bob`.
 */
export const scopeDeclarations = {
  ...knowledgeMemoryScopes(),
};

export function createKnowledge(storage: MastraCompositeStore) {
  return new Knowledge({
    id: 'kelvara',
    name: 'Kelvara handbook',
    description: 'Kelvara Health handbook (fictional digital-health company): sites, suppliers, policies, products, playbooks.',
    storage,
    scopes: scopeDeclarations,
    // read cap: the default 1,000 tokens; long pages are read in parts (exercised by the fixture).
    tools: true,
  });
}

export type { Knowledge };
