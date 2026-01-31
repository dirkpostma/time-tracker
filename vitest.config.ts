import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'node_modules',
      'dist',
      '**/node_modules/**',
      '**/dist/**',
      'packages/mobile/**',      // Uses Jest, not Vitest
      'packages/web/e2e/**',     // Uses Playwright, not Vitest
    ],
    // Run test files sequentially to avoid timer conflicts
    // (spec: only one timer can run at a time globally)
    fileParallelism: false,
    // Local Supabase credentials (via `npm run db:start`)
    env: {
      SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    },
    coverage: {
      exclude: ['**/dist/**', '**/node_modules/**', '**/*.test.ts'],
    },
  },
});
