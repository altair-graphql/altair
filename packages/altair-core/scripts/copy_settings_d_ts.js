const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const distSrc = path.resolve(__dirname, '../build');

fs.copyFileSync(
  path.resolve(srcDir, 'validate-settings.d.ts'),
  path.resolve(distSrc, 'validate-settings.d.ts')
);

fs.copyFileSync(
  path.resolve(srcDir, 'validate-partial-settings.d.ts'),
  path.resolve(distSrc, 'validate-partial-settings.d.ts')
);
