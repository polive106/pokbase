import { Mastra } from '@mastra/core/mastra';
import { Memory } from '@mastra/memory';
import { KNOWLEDGE_ROUTES } from '@mastra/server/server-adapter';
import { createAssistantAgent, createReaderAgent, createIngestAgent } from '../agents.js';
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
export const ingestAgent = createIngestAgent(knowledge);

export const mastra = new Mastra({
  storage,
  agents: { readerAgent, assistantAgent, ingestAgent },
  workflows: { ingestSourceWorkflow },
  knowledge: { kelvara: knowledge },
  server: {
    apiRoutes: [...KNOWLEDGE_ROUTES],
    middleware: [scopeMiddleware],
  },
});
