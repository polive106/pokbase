import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    fileParallelism: false, // tests spawn workers and share the PGlite socket in STORE=pg mode
    testTimeout: 600_000,
    hookTimeout: 120_000,
    globalSetup: ['tests/global-setup.ts'],
    reporters: ['default'],
  },
});
