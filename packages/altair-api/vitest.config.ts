import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./test/custom-matchers.ts'],
    root: './',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      test: path.resolve(__dirname, 'test'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
