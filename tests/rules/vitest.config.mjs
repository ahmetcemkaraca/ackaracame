import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    include: ['tests/rules/**/*.test.mjs'],
    testTimeout: 20_000,
    hookTimeout: 20_000
  }
});
