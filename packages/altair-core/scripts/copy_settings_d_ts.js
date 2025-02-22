/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const getValidateDTSContent = (base) => {
  return `import { ValidateFunction } from 'ajv';
import type { Type } from './${base}';
declare let v: ValidateFunction<Type>;
export default v;
`;
};
const copySettingsDTS = async () => {
  const { snakeCase, kebabCase } = await import('change-case');
  const srcDir = path.resolve(__dirname, '../src');
  const distSrc = path.resolve(__dirname, '../build');

  const typeGenDir = path.resolve(srcDir, 'typegen');
  const typeGenDistDir = path.resolve(distSrc, 'typegen');

  if (fs.existsSync(typeGenDir)) {
    fs.mkdirSync(typeGenDistDir, { recursive: true });
    await Promise.all(
      fs.readdirSync(typeGenDir).map(async (file) => {
        if (path.extname(file) !== '.ts') {
          return;
        }
        const base = path.basename(file, '.ts');

        const schemaFileName = `${snakeCase(base)}.schema.json`;
        const validateFileNameBase = `validate-${kebabCase(base)}`;
        const validateFileName = `${validateFileNameBase}.js`;
        const validateDTSFileName = `${validateFileNameBase}.d.ts`;

        // eslint-disable-next-line no-console
        console.log('Generating types for', base, '...');
        const { stderr } = await exec(
          `pnpm typescript-json-schema --ignoreErrors --required --noExtraProps src/typegen/${file} Type  --out build/typegen/${schemaFileName}`
        );
        if (stderr) {
          // eslint-disable-next-line no-console
          console.error(stderr);
          return;
        }
        const { stderr: stderr2 } = await exec(
          `pnpm ajv compile --all-errors --strict=true -s build/typegen/${schemaFileName} -o build/typegen/${validateFileName}`
        );
        if (stderr2) {
          // eslint-disable-next-line no-console
          console.error(stderr2);
          return;
        }
        await fsPromises.writeFile(
          path.resolve(typeGenDistDir, validateDTSFileName),
          getValidateDTSContent(base)
        );
      })
    );
  }
};
module.exports.copySettingsDTS = copySettingsDTS;
