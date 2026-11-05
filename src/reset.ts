import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { config } from './config.js';

/** Deletes ./data, ./out and ./raw after confirmation (`--yes` to skip the prompt). */
const targets = [path.join(config.root, 'data'), path.join(config.root, 'out'), path.join(config.root, 'raw')].filter(existsSync);
if (!targets.length) {
  console.log('nothing to delete');
  process.exit(0);
}
console.log('This deletes:\n' + targets.map((t) => `  ${path.relative(config.root, t)}/`).join('\n'));
let ok = process.argv.includes('--yes');
if (!ok) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  ok = /^y(es)?$/i.test((await rl.question('Proceed? [y/N] ')).trim());
  rl.close();
}
if (!ok) {
  console.log('aborted');
  process.exit(1);
}
for (const t of targets) rmSync(t, { recursive: true, force: true });
console.log('deleted');
