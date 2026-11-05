import { isMain } from './lib/cli.js';
import { Queue } from './ingest/queue.js';
import { decide, listPending } from './ingest/review-gate.js';

/** Escapes control characters (incl. ESC sequences) so pending-write content cannot spoof or hide text in the terminal. */
const safe = (s: string) => s.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, (c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`);

/**
 * npm run review                      list pending writes
 * npm run review -- approve <id>      let the write happen; the run resumes
 * npm run review -- reject <id> [why] decline it; the agent is told and continues without it
 */
if (isMain(import.meta.url)) {
  const [cmd, idArg, ...why] = process.argv.slice(2);
  const queue = await Queue.open();
  if (!cmd || cmd === 'list') {
    const pending = await listPending(queue);
    if (!pending.length) console.log('no pending writes');
    for (const p of pending) {
      const args = JSON.parse(p.args);
      const { body, ...rest } = args;
      console.log(`#${p.id}  run ${p.run_id}  ${p.tool} ${safe(JSON.stringify(rest))}`);
      if (body !== undefined) console.log(safe(String(body)).split('\n').map((l) => `    │ ${l}`).join('\n'));
      if (args.text) console.log(`    │ ${safe(String(args.text))}`);
    }
  } else if (cmd === 'approve' || cmd === 'reject') {
    const ok = await decide(queue, Number(idArg), cmd === 'approve' ? 'approved' : 'rejected', why.join(' ') || undefined);
    console.log(ok ? `${cmd}d #${idArg}` : `#${idArg} not pending`);
  } else {
    console.error('usage: npm run review [-- list | approve <id> | reject <id> [reason]]');
    process.exitCode = 2;
  }
  queue.close();
}
