import path from 'node:path';
import { MCPClient } from '@mastra/mcp';
import { config } from '../config.js';

/**
 * Spawns the stdio MCP server like an MCP host would and exercises it: list tools, search, read,
 * add a note, and (with --ask) ask_reader. Usage: npm run mcp:smoke [-- --ask "question"] [POC_USER=bob]
 */
const client = new MCPClient({
  id: 'kb-smoke',
  servers: {
    kb: {
      command: process.execPath,
      args: ['--import', 'tsx', path.join(config.root, 'src/mcp/stdio.ts')],
      env: { ...(process.env as Record<string, string>) },
    },
  },
});
const tools = await client.listTools();
console.log('tools:', Object.keys(tools).join(', '));
const call = async (name: string, args: Record<string, unknown>) => {
  const r: any = await tools[`kb_${name}`].execute!(args as any, {} as any); // client namespaces tools as <server>_<tool>
  const text = r?.content?.[0]?.text;
  try {
    return JSON.parse(text);
  } catch {
    return text ?? r;
  }
};
const show = (label: string, r: unknown) => console.log(`\n== ${label}\n${JSON.stringify(r, null, 2).slice(0, 900)}`);
show('search "break-glass access"', await call('search', { query: 'break-glass access', limit: 3 }));
show('read sites/thornfield-backup-centre (section Uses)', await call('read', { page: 'org:kelvara#sites/thornfield-backup-centre', section: 'Uses' }));
show('add_note (private)', await call('add_note', { page: 'org:kelvara#sites/thornfield-backup-centre', text: `MCP smoke test note (${new Date().toISOString().slice(0, 10)})`, private: true }));
show('read resource:bob (expect refusal for alice)', await call('read', { page: 'resource:bob' }).catch((e: any) => ({ refused: e.message })));
const i = process.argv.indexOf('--ask');
if (i > 0) show('ask_reader', await call('ask_reader', { message: process.argv[i + 1] }));
await client.disconnect();
