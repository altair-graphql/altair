import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { manifest } from './manifest.config';
import { generateManifest } from './generate-manifest';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generateManifest(manifest)],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        options: resolve(__dirname, 'src/options.html'),
        devtools: resolve(__dirname, 'src/devtools/devtools.html'),
        monitor_panel: resolve(__dirname, 'src/monitor/monitor_panel.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
