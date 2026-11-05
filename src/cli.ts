import { readFileSync } from 'node:fs';
import { config } from './config.js';
import { isMain } from './lib/cli.js';
import { callTool } from './lib/tool-call.js';
import { scopesForUser } from './scopes.js';

/**
 * Key-free read/write access to the KB through the real Knowledge tools, as a user (alice|bob):
 *
 *   npm run kb -- search "elmhaven closure"
 *   npm run kb -- list [ref]
 *   npm run kb -- read org:kelvara#sites/elmhaven-monitoring-centre [--section Facilities]
 *   npm run kb -- note org:kelvara#sites/elmhaven-monitoring-centre "Station 4 screen replaced (2026-11-05)"
 *   npm run kb -- write org:kelvara#sites/elmhaven-monitoring-centre path/to/body.md   (whole-body write, needs --version N)
 *   npm run kb -- create sites/new-page "New page" path/to/body.md
 *   npm run kb -- ask "When does the Elmhaven monitoring centre close?"   (reader agent; LLM if a key is set, else mock)
 *   --user bob       run as Bob (scopes org:kelvara + resource:bob)
 */
if (isMain(import.meta.url)) {
  const argv = process.argv.slice(2);
  const flag = (name: string) => {
    const i = argv.indexOf(`--${name}`);
    if (i < 0) return undefined;
    const v = argv[i + 1];
    argv.splice(i, 2);
    return v;
  };
  const user = flag('user') ?? 'alice';
  const section = flag('section');
  const version = flag('version');
  const [cmd, a, b, c] = argv;
  const scopes = scopesForUser(user);
  const { openKb } = await import('./kb.js');
  const kb = await openKb();
  const show = (r: any) => {
    if (r?.error) console.error('error:', r.error);
    else console.log(JSON.stringify(r?.result, null, 2));
  };
  switch (cmd) {
    case 'search':
      show(await callTool(kb.knowledge, scopes, 'knowledge_search', { query: a, limit: 10 }));
      break;
    case 'list':
      show(await callTool(kb.knowledge, scopes, 'knowledge_list', a ? { from: a, depth: 2 } : { depth: 2 }));
      break;
    case 'read': {
      const r = await callTool(kb.knowledge, scopes, 'knowledge_read', { page: a, ...(section ? { section } : {}) });
      if (r.error) console.error('error:', r.error);
      else {
        const p = r.result?.page;
        console.log(`# ${p?.name}  (${p?.ref}, v${p?.version})\n`);
        console.log(p?.body ?? p?.lines ?? JSON.stringify(r.result, null, 2));
        for (const n of r.result?.notes ?? []) console.log(`\n- note: ${n.text} — ${n.author ?? ''}`);
        if (r.result?.more) console.log('\nmore:', JSON.stringify(r.result.more));
      }
      break;
    }
    case 'note':
      show(await callTool(kb.knowledge, scopes, 'knowledge_note', { op: 'add', page: a, text: b, scope: [config.orgScope] }, { agentId: `cli-${user}` }));
      break;
    case 'write':
      if (!version) throw new Error('write needs --version <n> (the version you read)');
      show(await callTool(kb.knowledge, scopes, 'knowledge_page', { op: 'write', page: a, body: readFileSync(b, 'utf8'), expectedVersion: Number(version) }, { agentId: `cli-${user}` }));
      break;
    case 'create': {
      const parts = a.split('/');
      const key = parts.pop()!;
      show(
        await callTool(
          kb.knowledge,
          scopes,
          'knowledge_page',
          { op: 'write', scope: config.orgScope, ...(parts.length ? { parent: `${config.orgScope}#${parts.join('/')}` } : {}), key, name: b, body: c ? readFileSync(c, 'utf8') : '' },
          { agentId: `cli-${user}` },
        ),
      );
      break;
    }
    case 'ask': {
      const { createReaderAgent } = await import('./agents.js');
      const agent = createReaderAgent(kb.knowledge);
      const res: any = await agent.generate(a, { scopes, maxSteps: 12 } as any);
      for (const s of res.steps ?? []) for (const t of s.toolCalls ?? []) console.log(`  · ${t.payload?.toolName ?? t.toolName} ${JSON.stringify(t.payload?.args ?? t.args)}`);
      console.log(`\n${res.text}\n\n(model: ${config.model})`);
      break;
    }
    default:
      console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(6, 18).join('\n').replace(/^ \* ?/gm, ''));
  }
  await kb.close();
}
