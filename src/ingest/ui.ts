import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Knowledge } from '@mastra/core/knowledge';
import { MASTRA_RESOURCE_ID_KEY } from '@mastra/core/request-context';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { config } from '../config.js';
import { isUser } from '../scopes.js';
import { Queue } from './queue.js';
import { submit } from './submit.js';
import { processNextBatch } from './worker.js';

/**
 * Ingest from the UI: the same pipeline as `npm run submit` + `npm run worker`
 * (raw/ write-once + dedupe + queue + KB lease + fenced ingest agent), started from Studio.
 * The submitter comes from the server (scope middleware), never from the model or the form.
 */
/** One queue connection per process (the server), opened on first use. */
let sharedQueue: Promise<Queue> | undefined;
const getQueue = () => (sharedQueue ??= Queue.open());

const sourceInput = z.object({
  title: z.string().min(1).describe('A short title for the source, e.g. "Facilities bulletin 32".'),
  text: z.string().min(1).describe('The full source text, verbatim.'),
});

export async function ingestText(input: { title: string; text: string; submitter: string; knowledge: Knowledge; storage?: any }) {
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'source';
  const dir = path.join(config.dataDir, 'uploads');
  mkdirSync(dir, { recursive: true });
  // Unique name + exclusive create: concurrent submissions (even with the same title) never share or overwrite a file.
  const file = path.join(dir, `${slug}-${randomUUID()}.md`);
  writeFileSync(file, input.text.startsWith('#') ? input.text : `# ${input.title}\n\n${input.text}\n`, { flag: 'wx' });
  const queue = await getQueue();
  const sub = await submit(file, { queue, submitter: input.submitter });
  if (sub.status === 'duplicate') return { status: 'duplicate' as const, sourceId: sub.sourceId, message: 'Identical content was already submitted; nothing to do.' };
  // Process now if no other worker holds the KB lease; otherwise a running `npm run worker` picks it up.
  const log = await processNextBatch({ knowledge: input.knowledge, storage: input.storage, queue, worker: `ui:${input.submitter}` });
  if (typeof log === 'string') return { status: 'queued' as const, sourceId: sub.sourceId, message: 'Queued: another worker is ingesting this KB right now and will pick it up.' };
  return {
    status: log.outcome ?? 'error',
    sourceId: sub.sourceId,
    runId: log.runId,
    sourcesInBatch: log.sources.map((s) => s.id),
    pagesCreated: log.pagesCreated,
    pagesChanged: log.pagesChanged,
    notesAdded: log.notesAdded.length,
    summary: log.summary,
    error: log.error,
  };
}

const submitterOf = (requestContext: any) => {
  const u = requestContext?.get?.(MASTRA_RESOURCE_ID_KEY);
  return isUser(u) ? u : 'alice';
};

/** Chat tool for the Knowledge assistant: "ingest this source: …". */
export function createIngestSourceTool(knowledge: Knowledge, storage?: any) {
  return createTool({
    id: 'ingest_source',
    description:
      'Submit a raw source document (text the user pasted or dictated) to the knowledge-base ingestion pipeline: it is stored write-once, deduplicated, and integrated into the curated pages by the ingest agent (with citations, contradictions kept, superseded values marked). Use this when the user asks to ingest/import/add a source or document, rather than editing pages yourself. Pass the source text verbatim.',
    inputSchema: sourceInput,
    execute: async (input: any, ctx: any) => ingestText({ ...input, submitter: submitterOf(ctx?.requestContext), knowledge, storage }),
  } as any);
}

/** Studio workflow with a form: Workflows → Ingest source. */
export function createIngestWorkflow(knowledge: Knowledge, storage?: any) {
  const step = createStep({
    id: 'submit-and-ingest',
    inputSchema: sourceInput,
    outputSchema: z.any(),
    execute: async ({ inputData, requestContext }: any) => ingestText({ ...inputData, submitter: submitterOf(requestContext), knowledge, storage }),
  } as any);
  return createWorkflow({
    id: 'ingest-source',
    description: 'Paste a raw source; it is stored in raw/, deduplicated, queued and ingested into org:kelvara by the ingest agent.',
    inputSchema: sourceInput,
    outputSchema: z.any(),
  } as any)
    .then(step)
    .commit();
}
