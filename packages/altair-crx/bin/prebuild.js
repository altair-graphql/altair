import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { getDistDirectory, renderAltair, renderInitSnippet } from 'altair-static';
import { createRequire } from 'node:module';
import copy from 'recursive-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
console.log(getDistDirectory());
const dest = resolve(__dirname, '../public/altair-app');
const res = await copy(getDistDirectory(), dest, { overwrite: true, expand: true });
console.log(`Copied ${res.length} files to ${dest}`);

const indexPageOutput = renderAltair({
  baseURL: '/altair-app/',
  serveInitialOptionsInSeperateRequest: 'init.js',
});
const initScript = renderInitSnippet();

writeFileSync(resolve(dest, 'index.html'), indexPageOutput, 'utf8');
writeFileSync(resolve(dest, 'init.js'), initScript, 'utf8');
console.log('Updated additional files');
