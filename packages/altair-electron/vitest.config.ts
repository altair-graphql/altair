import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.?(c|m)[t]s?(x)'],
    coverage: {
      provider: 'v8',
    },
    clearMocks: true,
  },
});
