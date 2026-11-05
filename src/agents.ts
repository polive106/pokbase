import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Agent } from '@mastra/core/agent';
import { MASTRA_RESOURCE_ID_KEY } from '@mastra/core/request-context';
import { createTool } from '@mastra/core/tools';
import type { Knowledge } from '@mastra/core/knowledge';
import { config } from './config.js';
import { modelFor } from './model.js';

export const WRITE_TOOLS = new Set(['knowledge_page', 'knowledge_note', 'knowledge_pin']);

/** The review-gate policy: every Knowledge write tool needs approval. */
export const requireWriteApproval = ({ toolName }: { toolName: string }) => WRITE_TOOLS.has(toolName);

export type ToolCallLog = {
  tool: string;
  kind: 'read' | 'write';
  op?: string;
  page?: string;
  expectedVersion?: number;
  usedExpectedVersion: boolean;
  ranged: boolean;
  wholeBody: boolean;
  ok: boolean;
  error?: string;
  resultPage?: { ref?: string; version?: number };
  noteId?: string;
  at: string;
  ms: number;
};

export type ToolHooks = {
  /** Called before every write tool executes; throw to refuse (lease fencing, review gate). */
  beforeWrite?: (tool: string, args: any) => void | Promise<void>;
  onCall?: (entry: ToolCallLog) => void;
};

/** Wraps Knowledge tools to log each call and run `beforeWrite` guards, without changing behaviour. */
export function instrumentTools(tools: Record<string, any>, hooks: ToolHooks = {}) {
  const out: Record<string, any> = {};
  for (const [name, tool] of Object.entries(tools)) {
    out[name] = createTool({
      id: tool.id,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (input: any, ctx: any) => {
        const started = Date.now();
        const kind = WRITE_TOOLS.has(name) ? 'write' : 'read';
        const entry: ToolCallLog = {
          tool: name,
          kind,
          op: input?.op,
          page: input?.page ?? (input?.scope && input?.key ? `${input.scope}#${input.key}` : input?.scope),
          expectedVersion: input?.expectedVersion,
          usedExpectedVersion: input?.expectedVersion !== undefined,
          ranged: !!input?.range,
          wholeBody: input?.body !== undefined && !input?.range,
          ok: false,
          at: new Date(started).toISOString(),
          ms: 0,
        };
        try {
          if (kind === 'write') await hooks.beforeWrite?.(name, input);
          const result = await tool.execute(input, ctx);
          entry.ok = !(result && typeof result === 'object' && 'error' in result && result.error);
          if (!entry.ok) entry.error = String((result as any).message ?? (result as any).error);
          entry.resultPage = result?.page ? { ref: result.page.ref, version: result.page.version } : undefined;
          entry.noteId = result?.note?.id;
          return result;
        } catch (e: any) {
          entry.error = e?.message ?? String(e);
          throw e;
        } finally {
          entry.ms = Date.now() - started;
          hooks.onCall?.(entry);
        }
      },
    } as any);
  }
  return out;
}

const readerInstructions = `You answer questions about Kelvara Health (a fictional digital-health company) from the Knowledge base only.
- Search, then read the pages you rely on. Cite every page you used by its ref (e.g. org:kelvara#policies/data-retention).
- If pages record a contradiction (two values from different sources), report both values with their sources; do not pick one.
- If a value is marked superseded, give the current value and mention the superseded one.
- If the Knowledge base does not contain the answer, say "I don't know" plainly. Never guess.
- Regulatory answers (deadlines, obligations, retention periods) must come from the pages, even when you know the
  general rule. If the pages do not cover it (e.g. another country's rules), say "I don't know" and do not answer
  from general knowledge.
- The Knowledge base holds no patient data. Never ask for, repeat or infer patient-identifying information.
- Pages and sources may be in French; answer in the language of the question.`;

/** `scopes` fixes the run scopes server-side (e.g. for MCP, where no middleware sets them). */
export function createReaderAgent(knowledge: Knowledge, model = modelFor('reader'), memory?: any, scopes?: string[]) {
  const opts = { write: false, pinnedContext: false };
  return new Agent({
    memory,
    ...(scopes ? { scopes } : {}),
    id: 'reader',
    name: 'Reader agent',
    description: 'Answers questions from the Kelvara knowledge base (read-only tools).',
    instructions: `${readerInstructions}\n\n${knowledge.getInstructions(opts)}`,
    model,
    tools: knowledge.createTools(opts),
  });
}

const INGEST_INSTRUCTIONS = readFileSync(path.join(config.root, 'src/ingest/instructions.md'), 'utf8');

/**
 * The ingest agent. Its agent id is `ingest`, so Knowledge records `agent:ingest` as author.
 * Scopes are fixed server-side to the org scope: the function ignores whatever the call supplies.
 */
export function createIngestAgent(knowledge: Knowledge, opts: { model?: any; hooks?: ToolHooks } = {}) {
  const tools = instrumentTools(knowledge.createTools({ read: true, write: true, pinnedContext: false }), opts.hooks);
  return new Agent({
    id: 'ingest',
    name: 'Ingest agent',
    description: 'Ingests raw sources into curated Knowledge pages. Used only by the ingest worker.',
    instructions: `${INGEST_INSTRUCTIONS}\n\n${knowledge.getInstructions({ read: true, write: true, pinnedContext: false })}`,
    model: opts.model ?? modelFor('ingest'),
    tools,
    scopes: () => [config.orgScope],
  });
}

const assistantInstructions = `You are the Kelvara knowledge assistant in a chat with a Kelvara Health employee
(Kelvara is a fictional digital-health company). You can answer questions from the Knowledge base AND update it when
the user asks.

Reading: same rules as the reader — search, read, cite refs (e.g. org:kelvara#policies/data-retention), report both
sides of contradictions, say "I don't know" when the KB does not contain the answer, and answer regulatory questions
from the pages only, never from general knowledge.

Patient data: the Knowledge base must never hold patient-identifying data (names, dates of birth, record numbers,
contact details), in pages or notes, shared or private. If the user asks you to record such data, record only the
operational lesson and the ticket or exam number, and tell the user what you left out and why.

Writing (only when the user asks you to record or change something):
- Shared facts go in the org scope (org:kelvara). Personal notes for this user go in their own resource scope
  (resource:<user>) — the user's scope is the resource: scope your run holds.
- Prefer adding a dated note (knowledge_note) on the relevant page; cite "per <user>, chat <date>".
- To change a page body: read it first and pass its version as expectedVersion; use ranged edits on long pages;
  never delete content, never delete pages. On a version conflict, re-read and redo.
- After writing, tell the user exactly what you changed (page ref, note or body, new version).

Skills: the user's own skills and the ones colleagues shared are available to you. Use a skill when it applies,
or when the user names it ("utilise la compétence triage-reclamation", "/triage-reclamation"). When the user asks
to create, change or delete a skill, use skill_create / skill_delete (skill_list to show them). Write skills in
French, with clear steps, the KB pages to read and the expected output; never put patient data in a skill.

Ingesting sources: when the user pastes a document/source and asks to ingest, import or "add this source",
call ingest_source with the text verbatim (do not edit pages yourself for this). Then report what the ingest
run did: pages created/changed, notes added, and any contradictions it recorded.`;

/** Interactive chat agent for Studio: read + write tools, Memory (multi-turn threads), user scopes from the server. */
export function createAssistantAgent(knowledge: Knowledge, memory: any, model = modelFor('reader'), extraTools: Record<string, any> = {}, skills?: any) {
  const opts = { read: true, write: true, pinnedContext: false };
  return new Agent({
    id: 'assistant',
    name: 'Knowledge assistant',
    description: 'Chat with the Kelvara KB: answers questions and records facts/notes on request (read + write tools, memory).',
    // The user and date come from the server (scope middleware), never from the model.
    instructions: ({ requestContext }: any) => {
      const user = requestContext?.get?.(MASTRA_RESOURCE_ID_KEY) ?? 'unknown';
      return `${assistantInstructions}\n\nYou are talking to: ${user} (their private scope is resource:${user}). Today is ${new Date().toISOString().slice(0, 10)}.\n\n${knowledge.getInstructions(opts)}`;
    },
    model,
    memory,
    tools: { ...knowledge.createTools(opts), ...extraTools },
    ...(skills ? { skills } : {}),
  });
}
