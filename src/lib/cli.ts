import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** True when the module was run directly (`tsx src/x.ts`), not imported. */
export function isMain(metaUrl: string) {
  const entry = process.argv[1];
  // CLIs run from .ts via tsx. In a bundle (mastra dev → .mastra/output/index.mjs) every module shares
  // the entry file, so without this check every CLI main block would run inside the server.
  if (!entry || !/\.ts$/.test(entry) || !fileURLToPath(metaUrl).endsWith('.ts')) return false;
  return path.resolve(entry).replace(/\.ts$/, '') === fileURLToPath(metaUrl).replace(/\.ts$/, '');
}
