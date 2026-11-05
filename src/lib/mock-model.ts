/**
 * A minimal AI SDK LanguageModelV2 for deterministic runs without an API key.
 *
 * It lets deterministic tests drive Knowledge tools through a real Mastra `Agent` (so run scopes are
 * resolved by the agent runtime exactly as in production; tools refuse scopes not marked by it),
 * and lets the ingest worker run end-to-end with `MODEL=mock`.
 */
export type ScriptToolCall = { name: string; args: Record<string, unknown> };
export type ScriptStep = { toolCalls?: ScriptToolCall[]; text?: string };
export type Script = ScriptStep[] | ((step: number, prompt: PromptMessage[]) => ScriptStep);
type PromptMessage = { role: string; content: any };

let callSeq = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function scriptedModel(script: Script, opts: { delayMs?: number; id?: string } = {}) {
  // Stateless: the step is the number of assistant turns already in the prompt, so one model
  // instance can serve many concurrent runs (e.g. a long-lived dev server).
  const next = (prompt: PromptMessage[]): ScriptStep => {
    const step = prompt.filter((m) => m.role === 'assistant').length;
    return typeof script === 'function' ? script(step, prompt) : (script[step] ?? { text: 'done' });
  };
  const usage = () => ({ inputTokens: 100, outputTokens: 20, totalTokens: 120 });
  return {
    specificationVersion: 'v2' as const,
    provider: 'mock',
    modelId: opts.id ?? 'scripted',
    supportedUrls: {},
    async doGenerate(o: any) {
      if (opts.delayMs) await sleep(opts.delayMs);
      const s = next(o.prompt);
      const content: any[] = [];
      if (s.text) content.push({ type: 'text', text: s.text });
      for (const c of s.toolCalls ?? []) content.push({ type: 'tool-call', toolCallId: `mock_${++callSeq}`, toolName: c.name, input: JSON.stringify(c.args) });
      return { content, finishReason: s.toolCalls?.length ? 'tool-calls' : 'stop', usage: usage(), warnings: [] };
    },
    async doStream(o: any) {
      if (opts.delayMs) await sleep(opts.delayMs);
      const s = next(o.prompt);
      const parts: any[] = [{ type: 'stream-start', warnings: [] }];
      if (s.text) parts.push({ type: 'text-start', id: 't' }, { type: 'text-delta', id: 't', delta: s.text }, { type: 'text-end', id: 't' });
      for (const c of s.toolCalls ?? []) parts.push({ type: 'tool-call', toolCallId: `mock_${++callSeq}`, toolName: c.name, input: JSON.stringify(c.args) });
      parts.push({ type: 'finish', finishReason: s.toolCalls?.length ? 'tool-calls' : 'stop', usage: usage() });
      return {
        stream: new ReadableStream({
          start(ctrl) {
            for (const p of parts) ctrl.enqueue(p);
            ctrl.close();
          },
        }),
      };
    },
  };
}

/** All text in the prompt, flattened. */
export function promptText(prompt: PromptMessage[]): string {
  return prompt
    .map((m) => (typeof m.content === 'string' ? m.content : (m.content ?? []).map((p: any) => p.text ?? '').join('\n')))
    .join('\n');
}

/** The last tool result's JSON value in the prompt. */
export function lastToolResult(prompt: PromptMessage[]): any {
  for (let i = prompt.length - 1; i >= 0; i--) {
    const m = prompt[i];
    if (m.role !== 'tool') continue;
    const part = (m.content ?? []).at(-1);
    return part?.output?.value ?? part?.output ?? part?.result;
  }
  return undefined;
}

/**
 * Mock ingest agent: for each `<source id="src:…">` in the user message, records the source on an
 * intake page (one create per source) through `knowledge_page`, then summarises. It does not try to
 * understand the source; T9–T11/T14 need a real model.
 */
export function mockIngestModel(delayMs = 0) {
  return scriptedModel(
    (step, prompt) => {
      const text = promptText(prompt.filter((m) => m.role === 'user'));
      const sources = [...text.matchAll(/<source id="(src:[0-9a-f]{12})"[^>]*>([\s\S]*?)<\/source>/g)].map((m) => ({ id: m[1], body: m[2].trim() }));
      if (step < sources.length) {
        const s = sources[step];
        const short = s.id.slice(4);
        const firstLine = s.body.split('\n').find((l) => l.trim())?.replace(/^#+\s*/, '').slice(0, 80) ?? s.id;
        return {
          toolCalls: [
            {
              name: 'knowledge_page',
              args: {
                op: 'write',
                scope: 'org:kelvara',
                key: `intake-${short}`,
                name: `Intake ${s.id}`,
                description: `Unreviewed intake of ${s.id}: ${firstLine}`.slice(0, 300),
                body: `# Intake ${s.id}\n\n> Recorded by the mock ingest model; not curated.\n\n${firstLine} [^${short}]\n\n[^${short}]: ${s.id}\n`,
              },
            },
          ],
        };
      }
      return { text: `Pages created: ${sources.length} intake pages. Pages changed: 0. Contradictions recorded: 0.` };
    },
    { delayMs, id: 'mock-ingest' },
  );
}

/** Mock reader: one keyword search, then an answer listing the hits it found (or an abstention). */
export function mockReaderModel() {
  return scriptedModel(
    (step, prompt) => {
      if (step === 0) {
        const q = promptText(prompt.filter((m) => m.role === 'user')).trim().split('\n').at(-1) ?? '';
        const words = q.replace(/[?.,!'"]/g, ' ').split(/\s+/).filter((w) => w.length > 3).slice(0, 6).join(' ');
        return { toolCalls: [{ name: 'knowledge_search', args: { query: words || q, limit: 5 } }] };
      }
      const res = lastToolResult(prompt);
      const hits: any[] = res?.results ?? [];
      if (!hits.length) return { text: 'I could not find this in the knowledge base. (mock reader)' };
      const lines = hits.slice(0, 3).map((h) => `- ${h.page?.name ?? h.name} (${h.page?.ref ?? h.ref})${h.snippet ? `: ${h.snippet}` : ''}`);
      return { text: `(mock reader — keyword hits only, no reasoning)\nRelevant pages:\n${lines.join('\n')}` };
    },
    { id: 'mock-reader' },
  );
}
