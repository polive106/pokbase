import { mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import { config } from '../config.js';
import { isMain } from '../lib/cli.js';
import { Queue } from './queue.js';
import { submit } from './submit.js';
import { isUser } from '../scopes.js';

/** Imitates a client system: every file dropped into drop/ (or drop/<alice|bob>/) is submitted. */
if (isMain(import.meta.url)) {
  mkdirSync(config.dropDir, { recursive: true });
  const queue = await Queue.open();
  console.log(`watching ${config.dropDir} (drop/<alice|bob>/file sets the submitter; default ${process.env.SUBMITTER ?? 'alice'})`);
  chokidar
    .watch(config.dropDir, { ignoreInitial: false, awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 } })
    .on('add', async (file) => {
      try {
        if (!statSync(file).isFile() || path.basename(file).startsWith('.')) return;
        const sub = path.relative(config.dropDir, file).split(path.sep)[0];
        const submitter = isUser(sub) ? sub : undefined;
        const r = await submit(file, { queue, submitter });
        console.log(`${r.status.padEnd(9)} ${r.sourceId}  ${path.relative(config.dropDir, file)}`);
      } catch (e: any) {
        console.error(`failed ${file}: ${e.message}`);
      }
    });
}
