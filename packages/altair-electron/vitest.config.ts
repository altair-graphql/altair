import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.?(c|m)[t]s?(x)'],
    clearMocks: true,
  },
  resolve: {
    alias: {
      // electron-store requires('electron') unconditionally at the top level,
      // which triggers Electron's binary check and fails in CI. Alias it to an
      // empty stub so the real electron package is never loaded during tests.
      electron: new URL('./src/__mocks__/electron.ts', import.meta.url).pathname,
    },
  },
  server: {
    deps: {
      // Force electron-store through Vite's pipeline so the `electron` alias
      // above intercepts its require('electron') call. Without this, CJS
      // require() bypasses Vite's resolver and loads the real electron binary.
      inline: ['electron-store'],
    },
  },
});
