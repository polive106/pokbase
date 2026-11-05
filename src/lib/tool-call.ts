import { Agent } from '@mastra/core/agent';
import type { Knowledge } from '@mastra/core/knowledge';
import { createTool } from '@mastra/core/tools';
import { scriptedModel, type ScriptToolCall } from './mock-model.js';

export type ToolCallResult = { tool: string; args: any; result?: any; error?: string };

/**
 * Executes Knowledge tool calls through a real Agent run (scripted model), so run scopes are
 * resolved by Mastra exactly as in production. Tools refuse scopes not set by the agent runtime,
 * which is why we cannot call `tool.execute` with a hand-made request context.
 *
 * Calls in one step run concurrently (parallel tool calls), which T3 uses for concurrent writes.
 */
export async function callTools(knowledge: Knowledge, scopes: string[], steps: ScriptToolCall[][], opts: { agentId?: string } = {}) {
  const results: ToolCallResult[] = [];
  const tools = Object.fromEntries(
    Object.entries(knowledge.createTools({ read: true, write: true, pinnedContext: false })).map(([name, t]: [string, any]) => [
      name,
      createTool({
        id: t.id,
        description: t.description,
        inputSchema: t.inputSchema,
        execute: async (input: any, ctx: any) => {
          const slot: ToolCallResult = { tool: name, args: input };
          results.push(slot); // in call order
          try {
            slot.result = await t.execute(input, ctx);
            if (slot.result?.error) slot.error = String(slot.result.message ?? slot.result.error);
            return slot.result;
          } catch (e: any) {
            slot.error = e?.message ?? String(e);
            throw e;
          }
        },
      } as any),
    ]),
  );
  const agent = new Agent({
    id: opts.agentId ?? 'tool-runner',
    name: 'tool runner',
    instructions: 'Runs scripted Knowledge tool calls.',
    model: scriptedModel([...steps.map((toolCalls) => ({ toolCalls })), { text: 'done' }]) as any,
    tools,
  });
  await agent.generate('run', { scopes, maxSteps: steps.length + 2 } as any);
  return { results };
}

export async function callTool(knowledge: Knowledge, scopes: string[], name: string, args: Record<string, unknown>, opts: { agentId?: string } = {}) {
  const { results } = await callTools(knowledge, scopes, [[{ name, args }]], opts);
  // A call whose input fails the tool schema never reaches execute; the model gets a validation error.
  return results[0] ?? { tool: name, args, error: 'rejected before execute (input schema validation)' };
}
