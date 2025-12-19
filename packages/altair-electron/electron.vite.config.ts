import { defineConfig } from 'electron-vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  main: {
    build: {
      sourcemap: true,
    },
    plugins: [
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        org: 'altair-graphql',
        project: 'electron',
        release: {
          inject: true,
          create: false,
          deploy: false,
        },
      }),
    ],
  },
  preload: {},
  renderer: {},
});
