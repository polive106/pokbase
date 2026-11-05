import { describe, expect, it } from 'vitest';
import { callTool, callTools } from '../src/lib/tool-call.js';
import { record, testEnv } from './helpers.js';

const ORG = ['org:kelvara'];

describe('T3 Concurrent page writes [observe]', () => {
  it('records which of two parallel whole-body writes survives', async () => {
    const t = await testEnv('t03');
    const k = t.knowledge;
    const ref = 'org:kelvara#sites/race';
    await k.upsertPage({ scope: 'org:kelvara', path: 'sites/race', name: 'Race page', body: 'original body\n', author: 'process:seed' });

    // (a) two parallel writes, no expectedVersion: both in one model step, executed concurrently
    const a = await callTools(k, ORG, [[
      { name: 'knowledge_page', args: { op: 'write', page: ref, body: 'body from writer A\n' } },
      { name: 'knowledge_page', args: { op: 'write', page: ref, body: 'body from writer B\n' } },
    ]], { agentId: 'writer' });
    const afterA = (await callTool(k, ORG, 'knowledge_read', { page: ref })).result.page;

    // (b) two parallel writes with the same (current) expectedVersion
    const v = afterA.version;
    const b = await callTools(k, ORG, [[
      { name: 'knowledge_page', args: { op: 'write', page: ref, body: 'body from writer C\n', expectedVersion: v } },
      { name: 'knowledge_page', args: { op: 'write', page: ref, body: 'body from writer D\n', expectedVersion: v } },
    ]], { agentId: 'writer' });
    const afterB = (await callTool(k, ORG, 'knowledge_read', { page: ref })).result.page;

    // (c) sequential lost update without expectedVersion: both writers read v, both write (the second silently wins)
    const v2 = afterB.version;
    const c1 = await callTool(k, ORG, 'knowledge_page', { op: 'write', page: ref, body: 'writer E (read v' + v2 + ')\n' });
    const c2 = await callTool(k, ORG, 'knowledge_page', { op: 'write', page: ref, body: 'writer F (read v' + v2 + ', no expectedVersion)\n' });
    const c3 = await callTool(k, ORG, 'knowledge_page', { op: 'write', page: ref, body: 'writer G (stale expectedVersion)\n', expectedVersion: v2 });
    const afterC = (await callTool(k, ORG, 'knowledge_read', { page: ref })).result.page;

    const summarise = (rs: any[]) => rs.map((r) => ({ body: r.args.body.trim(), expectedVersion: r.args.expectedVersion, ok: !r.error, version: r.result?.page?.version, error: r.error }));
    const result = {
      status: 'OBSERVED',
      noExpectedVersion: { writes: summarise(a.results), survivor: afterA.body.trim(), finalVersion: afterA.version, bothSucceeded: a.results.every((r) => !r.error) },
      sameExpectedVersion: { writes: summarise(b.results), survivor: afterB.body.trim(), finalVersion: afterB.version, errors: b.results.filter((r) => r.error).map((r) => r.error) },
      sequentialLostUpdate: { writes: summarise([c1, c2, c3]), survivor: afterC.body.trim(), note: 'without expectedVersion the tool uses the version it just read itself, so a stale writer is never detected' },
    };
    record('t03', result);
    expect(b.results.filter((r) => r.error).length).toBeGreaterThanOrEqual(1); // one of the same-version writes must be refused
    await t.close();
  });
});

describe('T4 Scope isolation [observe + assert]', () => {
  it('alice cannot read bob through the tools; host APIs skip checks', async () => {
    const t = await testEnv('t04');
    const k = t.knowledge;
    const alice = ['org:kelvara', 'resource:alice'];
    const bob = ['org:kelvara', 'resource:bob'];
    const secret = 'BOB-PRIVATE-4417';
    const mkA = await callTool(k, alice, 'knowledge_page', { op: 'write', scope: 'resource:alice', key: 'notes', name: 'Alice notes', body: 'alice private ALICE-PRIVATE-0001\n' }, { agentId: 'alice' });
    const mkB = await callTool(k, bob, 'knowledge_page', { op: 'write', scope: 'resource:bob', key: 'notes', name: 'Bob notes', body: `bob private ${secret}\n` }, { agentId: 'bob' });
    const bobRef = mkB.result?.page?.ref ?? 'resource:bob#notes';
    const bobId = mkB.result?.page?.id;

    // tool path, as alice
    const attempts = {
      readByRef: await callTool(k, alice, 'knowledge_read', { page: bobRef }),
      readById: await callTool(k, alice, 'knowledge_read', { page: bobId }),
      readScope: await callTool(k, alice, 'knowledge_read', { page: 'resource:bob' }),
      search: await callTool(k, alice, 'knowledge_search', { query: secret }),
      searchScoped: await callTool(k, alice, 'knowledge_search', { query: 'bob', scope: ['resource:bob'] }),
      list: await callTool(k, alice, 'knowledge_list', { from: 'resource:bob' }),
      writeIntoBob: await callTool(k, alice, 'knowledge_page', { op: 'write', scope: 'resource:bob', key: 'planted', name: 'Planted', body: 'x' }),
      noteOnBob: await callTool(k, alice, 'knowledge_note', { op: 'add', page: bobRef, text: 'hi', scope: ['resource:bob'] }),
      noteStampedBobOnOrg: await callTool(k, alice, 'knowledge_note', { op: 'add', page: 'org:kelvara', text: 'stamped for bob', scope: ['resource:bob'] }),
    };
    const leaked = (r: any) => !r.error && /bob private|resource:bob#/.test(JSON.stringify(r.result ?? {})); // page content or refs, not the echoed query
    const toolPath = Object.fromEntries(Object.entries(attempts).map(([n, r]) => [n, { leaked: leaked(r), refused: !!r.error, error: r.error, resultCount: r.result?.results?.length ?? r.result?.entries?.length }]));
    const bobOwnRead = await callTool(k, bob, 'knowledge_read', { page: bobRef });

    // host path: no run scopes, no access checks
    const hostWrite = await k.upsertPage({ scope: 'resource:bob', path: 'host-planted', name: 'Written by host on behalf of alice', body: 'host write', author: 'resource:alice' });
    const storage = await k.getStorage();
    const hostReadAll = await storage.getPage({ id: bobId, read: 'all' });
    const aliceRead = await k.readScopeFor(alice);
    const hostReadAsAlice = await storage.getPage({ id: bobId, read: aliceRead });
    const explain = await k.explainAccess(alice, { page: bobRef });

    record('t04', {
      status: 'OBSERVED',
      assert: 'tool path: alice cannot read bob',
      setup: { aliceCreate: mkA.error ?? mkA.result?.page?.ref, bobCreate: mkB.error ?? bobRef },
      toolPath,
      bobCanReadOwn: !bobOwnRead.error,
      hostPath: {
        upsertPageIntoBobByAnyCaller: hostWrite.status,
        getPageReadAll: !!hostReadAll,
        getPageWithAliceReadScope: !!hostReadAsAlice,
        explainAccessAliceOnBob: explain,
        note: 'upsertPage/removePage/addNote and store reads with read:"all" perform no access checks (documented host-only)',
      },
    });
    for (const [n, r] of Object.entries(toolPath)) expect(r.leaked, n).toBe(false);
    expect(attempts.readByRef.error).toBeTruthy();
    expect(attempts.writeIntoBob.error).toBeTruthy();
    expect(bobOwnRead.error).toBeFalsy();
    await t.close();
  });
});
