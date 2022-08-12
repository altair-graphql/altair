/**
 * Mainly copied from https://github.com/angular/angular-cli/blob/master/packages/ngtools/webpack/src/ngcc_processor.ts
 * and adjusted to work with Jest
 */
// const { spawnSync } = require('child_process');
// const path = require('path');
import { spawnSync } from 'child_process';
import path from 'path';

const ANGULAR_COMPILER_CLI_PKG_NAME = `@angular${path.sep}compiler-cli`;
let ngccPath = '';

try {
  ngccPath = require.resolve('@angular/compiler-cli/ngcc/main-ngcc.js');
} catch {
  const compilerCliNgccPath = require.resolve('@angular/compiler-cli/ngcc');
  ngccPath = path.resolve(
    compilerCliNgccPath.substring(0, compilerCliNgccPath.lastIndexOf(path.sep)),
    'main-ngcc.js'
  );
}
function findNodeModulesDirectory() {
  return ngccPath.substring(0, ngccPath.indexOf(ANGULAR_COMPILER_CLI_PKG_NAME));
}

const nodeModuleDirPath = findNodeModulesDirectory();

const runNgccJestProcessorForNodeModule = (
  tsconfigPath: string,
  nodeModuleDir: string
) => {
  if (nodeModuleDir) {
    process.stdout.write(
      `\nngcc-jest-processor..: running ngcc for ${nodeModuleDir}\n`
    );

    const ngccBaseArgs = [
      ngccPath,
      '--source' /** basePath */,
      nodeModuleDir,
      '--properties' /** propertiesToConsider */,
      /**
       * There are various properties: fesm2015, fesm5, es2015, esm2015, esm5, main, module, browser to choose from.
       * Normally, Jest requires `umd`. If running Jest in ESM mode, Jest will require both `umd` + `esm2015`.
       */
      ...['es2015', 'main'],
      '--first-only' /** compileAllFormats */,
      'false', // make sure that `ngcc` runs on subfolders as well
      '--async',
    ];
    if (tsconfigPath) {
      ngccBaseArgs.push(...['--tsconfig', tsconfigPath]);
    }
    // We spawn instead of using the API because:
    // - NGCC Async uses clustering which is problematic when used via the API which means
    // that we cannot setup multiple cluster masters with different options.
    // - We will not be able to have concurrent builds otherwise Ex: App-Shell,
    // as NGCC will create a lock file for both builds and it will cause builds to fails.
    const { status, error } = spawnSync(process.execPath, ngccBaseArgs, {
      stdio: ['inherit', process.stderr, process.stderr],
    });
    if (status !== 0) {
      const errorMessage = error?.message ?? '';

      throw new Error(
        `${errorMessage} NGCC failed ${errorMessage ? ', see above' : ''}.`
      );
    }
  } else {
    console.log(
      `Warning: Could not locate '@angular/compiler-cli' to run 'ngcc' automatically.` +
        `Please make sure you are running 'ngcc-jest-processor.js' from root level of your project.` +
        `'ngcc' must be run before running Jest`
    );
  }
};
export const runNgccJestProcessor = (tsconfigPath: string) => {
  runNgccJestProcessorForNodeModule(
    tsconfigPath,
    path.resolve(__dirname, '../node_modules')
  );
  runNgccJestProcessorForNodeModule(
    tsconfigPath,
    path.resolve(__dirname, '../../../node_modules')
  );
};
