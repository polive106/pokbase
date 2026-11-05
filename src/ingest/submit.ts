import { createHash } from 'node:crypto';
import { constants, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { isMain } from '../lib/cli.js';
import { isUser } from '../scopes.js';
import { Queue } from './queue.js';

export type SubmitResult = { status: 'queued' | 'absorbed' | 'duplicate'; sha256: string; rawFile: string; jobId?: number; sourceId: string };

export const sourceId = (sha: string) => `src:${sha.slice(0, 12)}`;

/**
 * Puts a source in raw/ (write-once, content-addressed) and queues the KB job.
 * raw/ files are created with COPYFILE_EXCL and never modified or deleted by the pipeline.
 */
export async function submit(file: string, opts: { submitter?: string; kb?: string; queue?: Queue; rawDir?: string } = {}): Promise<SubmitResult> {
  const submitter = opts.submitter ?? process.env.SUBMITTER ?? 'alice';
  if (!isUser(submitter)) throw new Error(`submitter must be one of ${config.users.join(', ')}`);
  const kb = opts.kb ?? config.kb;
  const rawDir = opts.rawDir ?? config.rawDir;
  const bytes = readFileSync(file);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const ext = (path.extname(file).slice(1) || 'txt').toLowerCase();
  const rawFile = path.join(rawDir, `${sha256}.${ext}`);
  const name = path.basename(file);
  const base = { sha256, rawFile, sourceId: sourceId(sha256) };
  mkdirSync(rawDir, { recursive: true });
  try {
    copyFileSync(file, rawFile, constants.COPYFILE_EXCL); // write-once: fails if the content was seen before
  } catch (e: any) {
    if (e.code === 'EEXIST') return { status: 'duplicate', ...base };
    throw e;
  }
  const submittedAt = Date.now();
  writeFileSync(
    path.join(rawDir, `${sha256}.json`),
    JSON.stringify({ sha256, originalName: name, submitter, submittedAt: new Date(submittedAt).toISOString(), kb }, null, 2) + '\n',
    { flag: 'wx' },
  );
  const queue = opts.queue ?? (await Queue.open());
  try {
    const r = await queue.submitSource({ sha256, kb, ext, original_name: name, submitter, submitted_at: submittedAt });
    return { ...r, ...base };
  } finally {
    if (!opts.queue) queue.close();
  }
}

if (isMain(import.meta.url)) {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!files.length) {
    console.error('usage: npm run submit -- <file> [more files]   (SUBMITTER=alice|bob)');
    process.exit(2);
  }
  const queue = await Queue.open();
  for (const f of files) {
    const r = await submit(f, { queue });
    console.log(`${r.status.padEnd(9)} ${r.sourceId}  ${path.basename(f)}${r.jobId ? `  job #${r.jobId}` : ''}`);
  }
  queue.close();
}
