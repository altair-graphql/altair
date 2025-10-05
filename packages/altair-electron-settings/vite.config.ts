import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import flowbiteReact from 'flowbite-react/plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react(), commonjs(), flowbiteReact()],
  build: {
    rollupOptions: {
      external: ['electron'],
      output: {
        dir: 'dist',
        format: 'cjs',
      },
    },
  },
});
