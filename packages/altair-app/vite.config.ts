/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);

// uuid@9's exports map sends node ESM imports to wrapper.mjs, which does
// `import uuid from './dist/index.js'` (CJS).  When Vite inlines & transforms
// this, the CJS default-export interop breaks.  Resolve the package directory
// via the CJS main entry (which is allowed by the exports map) then point the
// alias directly at the proper ESM entry that uuid ships.
const uuidMain = require.resolve('uuid'); // → .../uuid/dist/index.js
const uuidEsm = path.join(path.dirname(uuidMain), 'esm-node', 'index.js');

// graphql@15.5.1 ships parallel CJS (.js) and ESM (.mjs) trees.  When
// server.deps.inline is true, the app's ESM imports resolve to .mjs files
// while codemirror-graphql's CJS deep imports (graphql/type/definition etc.)
// resolve to .js files.  Two separate module instances are loaded for the
// same types, breaking graphql's instanceof checks.  This plugin forces all
// graphql deep imports to use the .mjs entry so only one instance exists.
// It also redirects codemirror-graphql deep imports to their .esm.js entries
// which use ESM imports (resolving to graphql .mjs via this same plugin).
const graphqlDir = path.dirname(require.resolve('graphql'));
const cmGraphqlDir = path.dirname(
  require.resolve('codemirror-graphql/package.json')
);

function forceEsmPlugin() {
  return {
    name: 'force-esm-for-graphql',
    enforce: 'pre' as const,
    resolveId(source: string) {
      // Redirect graphql bare + deep imports to .mjs entries
      if (source === 'graphql' || source.startsWith('graphql/')) {
        const subpath =
          source === 'graphql' ? 'index' : source.slice('graphql/'.length);
        const mjsPath = path.join(graphqlDir, subpath + '.mjs');
        if (fs.existsSync(mjsPath)) {
          return mjsPath;
        }
        const jsPath = path.join(graphqlDir, subpath + '.js');
        if (fs.existsSync(jsPath)) {
          return jsPath;
        }
        return path.join(graphqlDir, subpath);
      }
      // Redirect codemirror-graphql deep imports to .esm.js entries
      if (source.startsWith('codemirror-graphql/')) {
        const subpath = source.slice('codemirror-graphql/'.length);
        const esmPath = path.join(cmGraphqlDir, subpath + '.esm.js');
        if (fs.existsSync(esmPath)) {
          return esmPath;
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [angular(), viteTsConfigPaths(), forceEsmPlugin()],
  resolve: {
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
    dedupe: ['graphql'],
    alias: [
      { find: 'uuid', replacement: uuidEsm },
    ],
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    server: {
      deps: {
        inline: true,
      },
    },
  },
}));
