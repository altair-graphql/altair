const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { copySettingsDTS } = require('./copy_settings_d_ts');

const walk = (dir, callback = () => {}) => {
  try {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        // Recurse into subdir
        results = [...results, ...walk(file, callback)];
      } else {
        // Is a file
        callback(file);
        results.push(file);
      }
    });
    return results;
  } catch (error) {
    console.error(`Error when walking dir ${dir}`, error);
  }
};
const replaceProcessEnv = (pkgRoot) => {
  const BUILD_DIR = path.join(pkgRoot, 'build');

  // Replace process.env variables with actual values in the build directory
  // Iterate over each JavaScript file in the input directory
  walk(BUILD_DIR, (file) => {
    // only replace process.env variables in .js files
    if (!file.endsWith('.js')) {
      return;
    }
    const fileContents = fs.readFileSync(file, 'utf8');
    const replacedContents = fileContents.replace(
      /process\.env\.([A-Za-z0-9_]+)/g,
      (_, p1) => {
        if (!process.env[p1]) {
          return `undefined`;
        }
        return `"${process.env[p1]}"`;
      }
    );
    fs.writeFileSync(file, replacedContents, 'utf8');
    console.log(`Edited file: ${file}`);
  });
};

const main = async () => {
  const CONFIG_PKG_ROOT = path.resolve(__dirname, '../');
  // Build the package
  execSync('pnpm tsc -p tsconfig.json', { cwd: CONFIG_PKG_ROOT, stdio: 'inherit' });
  execSync('pnpm tsc -p tsconfig.cjs.json', {
    cwd: CONFIG_PKG_ROOT,
    stdio: 'inherit',
  });
  await copySettingsDTS();
  replaceProcessEnv(CONFIG_PKG_ROOT);
};
main();
