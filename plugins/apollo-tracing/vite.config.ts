import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        plugin: fileURLToPath(new URL('./src/plugin.tsx', import.meta.url)),
      },
      output: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manualChunks: false as any,
        inlineDynamicImports: true,
        entryFileNames: '[name].js', // currently does not work for the legacy bundle
        assetFileNames: '[name].[ext]', // currently does not work for images
      },
    },
  },
});
