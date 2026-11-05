import type { Knowledge } from '@mastra/core/knowledge';
import { createTool } from '@mastra/core/tools';
import { MCPServer } from '@mastra/mcp';
import { z } from 'zod';
import { createReaderAgent } from '../agents.js';
import { config } from '../config.js';
import { ingestText } from '../ingest/ui.js';
import { callTool } from '../lib/tool-call.js';
import { isUser, scopesForUser } from '../scopes.js';

/**
 * MCP server for the Kelvara KB.
 *
 * Knowledge's own tools only accept run scopes that the agent runtime set, so they can't be exposed
 * raw over MCP (an MCP call carries no run scopes). These tools run the real Knowledge tools through
 * the agent-backed runner with scopes fixed on the server: the MCP user is `POC_USER` (alice | bob),
 * never something the MCP client or model sends.
 */
export function createKbMcpServer(knowledge: Knowledge, storage?: any) {
  const user = isUser(process.env.POC_USER) ? process.env.POC_USER : 'alice';
  const scopes = scopesForUser(user);
  const agentId = `mcp-${user}`; // recorded as author agent:mcp-<user>

  const run = async (tool: string, args: Record<string, unknown>) => {
    const r = await callTool(knowledge, scopes, tool, args, { agentId });
    if (r.error) throw new Error(r.error);
    return r.result;
  };

  const tools = {
    search: createTool({
      id: 'search',
      description: 'Keyword search over the Kelvara knowledge base pages and notes this user can read. Returns page refs to pass to read.',
      inputSchema: z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(50).optional() }),
      execute: async (a: any) => run('knowledge_search', a),
    }),
    list: createTool({
      id: 'list',
      description: 'List the page tree. Without `from`, lists the scopes this user holds (org:kelvara and resource:<user>). `from` is a scope or page ref, e.g. "org:kelvara#policies".',
      inputSchema: z.object({ from: z.string().optional(), depth: z.number().int().min(1).max(3).optional() }),
      execute: async (a: any) => run('knowledge_list', a),
    }),
    read: createTool({
      id: 'read',
      description: 'Read a page by ref (e.g. "org:kelvara#sites/elmhaven-monitoring-centre"): body (or numbered lines for long pages), version, notes, children. Optional `section` (heading) or `match` (terms) for long pages.',
      inputSchema: z.object({ page: z.string().min(1), section: z.string().optional(), match: z.union([z.string(), z.array(z.string())]).optional() }),
      execute: async (a: any) => run('knowledge_read', a),
    }),
    add_note: createTool({
      id: 'add_note',
      description: `Add a short, dated fact as a note on a page. Shared with the whole org by default; private=true makes it visible only to ${user} (resource:${user}).`,
      inputSchema: z.object({ page: z.string().min(1), text: z.string().min(1), private: z.boolean().optional(), when: z.string().optional().describe('ISO date the fact applies') }),
      execute: async ({ private: priv, ...a }: any) => run('knowledge_note', { op: 'add', ...a, scope: [priv ? `resource:${user}` : config.orgScope] }),
    }),
    edit_page: createTool({
      id: 'edit_page',
      description: 'Replace a page body (whole, or only `range` lines from a read of a long page). expectedVersion is required: pass the version you read; the write is refused if the page changed since.',
      inputSchema: z.object({
        page: z.string().min(1),
        body: z.string(),
        expectedVersion: z.number().int().min(1),
        range: z.object({ start: z.object({ line: z.number().int() }), end: z.object({ line: z.number().int() }) }).optional(),
      }),
      execute: async (a: any) => run('knowledge_page', { op: 'write', ...a }),
    }),
    create_page: createTool({
      id: 'create_page',
      description: 'Create a page in org:kelvara (or in your private scope with private=true), optionally under a parent page ref such as "org:kelvara#suppliers".',
      inputSchema: z.object({ key: z.string().min(1), name: z.string().min(1), body: z.string().optional(), description: z.string().optional(), parent: z.string().optional(), private: z.boolean().optional() }),
      execute: async ({ private: priv, ...a }: any) => run('knowledge_page', { op: 'write', scope: priv ? `resource:${user}` : config.orgScope, ...a }),
    }),
    ingest_source: createTool({
      id: 'ingest_source',
      description: 'Submit a raw source document to the ingestion pipeline (raw/ write-once, dedupe, queue, KB lease, ingest agent). The ingest agent integrates it into the curated pages with citations; takes ~20–60 s.',
      inputSchema: z.object({ title: z.string().min(1), text: z.string().min(1) }),
      execute: async (a: any) => ingestText({ ...a, submitter: user, knowledge, storage }),
    }),
  };

  // The reader agent as an MCP tool (ask_reader), with its scopes fixed here, server-side.
  const reader = createReaderAgent(knowledge, undefined, undefined, scopes);

  return new MCPServer({
    id: 'kelvara-kb',
    name: 'Kelvara KB',
    version: '0.1.0',
    description: `Kelvara Health knowledge base (Mastra Knowledge prototype, fictional data), acting as ${user}.`,
    instructions: `Search with search, read pages with read before relying on them, cite page refs. Record facts with add_note; edit bodies with edit_page using the version from read. Use ingest_source for whole source documents. ask_reader answers a question end-to-end. Never write patient-identifying data (names, dates of birth, record numbers, contact details) into pages or notes: refer to cases by ticket or exam number.`,
    tools,
    agents: { reader },
  });
}
