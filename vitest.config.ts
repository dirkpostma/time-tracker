import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules', 'dist'],
    // Run test files sequentially to avoid timer conflicts
    // (spec: only one timer can run at a time globally)
    fileParallelism: false,
  },
});
