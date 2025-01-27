import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { manifest } from './manifest.config';
import { generateManifest } from './generate-manifest';

// const __dirname = dirname(fileURLToPath(import.meta.url));
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: './node_modules/@altairgraphql/app/dist/**',
    //       dest: './$public/app/',
    //     },
    //   ],
    // }),
    react(),
    generateManifest(manifest),
    // crx({ manifest }),
  ],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        options: resolve(__dirname, 'src/options.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
