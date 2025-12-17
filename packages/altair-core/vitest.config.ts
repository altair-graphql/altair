import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.?(c|m)[t]s?(x)'],
    setupFiles: ['vitest.setup.ts'],
  },
});
