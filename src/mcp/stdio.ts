// stdout carries the MCP protocol: route every log line to stderr before anything else loads.
console.log = console.info = console.debug = (...args: unknown[]) => console.error(...args);

const { openKb } = await import('../kb.js');
const { createKbMcpServer } = await import('./server.js');

/**
 * stdio MCP server: `npm run -s mcp` (POC_USER=alice|bob). Register with Claude Code:
 *   claude mcp add kelvara-kb -e POC_USER=alice -- npx -y tsx /abs/path/src/mcp/stdio.ts
 */
const kb = await openKb();
await createKbMcpServer(kb.knowledge, kb.storage).startStdio();
export {};
