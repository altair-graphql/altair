import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/altair-app',
      'packages/altair-api',
      'packages/altair-core',
      'packages/altair-electron',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      reportOnFailure: true,
    },
  },
});
