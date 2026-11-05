import { Mastra } from '@mastra/core/mastra';
import { Memory } from '@mastra/memory';
import { KNOWLEDGE_ROUTES } from '@mastra/server/server-adapter';
import { createAssistantAgent, createReaderAgent } from '../agents.js';
import { modelFor } from '../model.js';
import { createKnowledge } from '../knowledge.js';
import { createStorage } from '../store.js';
import { scopeMiddleware } from '../scopes.js';
import { createIngestSourceTool, createIngestWorkflow } from '../ingest/ui.js';
import { createSkillTools, userSkillsResolver } from '../skills.js';

const storage = await createStorage();
export const knowledge = createKnowledge(storage);
const memory = new Memory({ storage, options: { lastMessages: 20 } });
export const readerAgent = createReaderAgent(knowledge, modelFor('reader'), memory);
// Chat agent for employees: KB tools, ingest, and employee skills (created from the chat, loaded per user).
export const assistantAgent = createAssistantAgent(
  knowledge,
  memory,
  modelFor('reader'),
  { ingest_source: createIngestSourceTool(knowledge, storage), ...createSkillTools(storage) },
  userSkillsResolver(storage),
);
export const ingestSourceWorkflow = createIngestWorkflow(knowledge, storage);

export const mastra = new Mastra({
  storage,
  // The ingest agent is NOT registered here: it would let any API/Studio caller write to org:kelvara outside the
  // queue, lease fencing and review gate. Ingestion only goes through ingest_source / the ingest-source workflow.
  agents: { readerAgent, assistantAgent },
  workflows: { ingestSourceWorkflow },
  knowledge: { kelvara: knowledge },
  server: {
    apiRoutes: [...KNOWLEDGE_ROUTES],
    middleware: [scopeMiddleware],
  },
});
