const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const copySettingsDTS = () => {
  const srcDir = path.resolve(__dirname, '../src');
  const distSrc = path.resolve(__dirname, '../build');

  execSync(
    'pnpm typescript-json-schema --ignoreErrors src/types/state/settings.interfaces.ts SettingsState  --out build/settings.schema.json'
  );
  execSync(
    'pnpm ajv compile -s build/settings.schema.json -o build/validate-settings.js'
  );

  execSync(
    'pnpm typescript-json-schema --ignoreErrors src/types/state/settings.interfaces.ts PartialSettingsState  --out build/partial_settings.schema.json'
  );
  execSync(
    'pnpm ajv compile -s build/partial_settings.schema.json -o build/validate-partial-settings.js'
  );

  fs.copyFileSync(
    path.resolve(srcDir, 'validate-settings.d.ts'),
    path.resolve(distSrc, 'validate-settings.d.ts')
  );

  fs.copyFileSync(
    path.resolve(srcDir, 'validate-partial-settings.d.ts'),
    path.resolve(distSrc, 'validate-partial-settings.d.ts')
  );
};
module.exports.copySettingsDTS = copySettingsDTS;
