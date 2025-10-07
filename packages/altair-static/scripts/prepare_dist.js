const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

ncp.limit = 16;

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
const altairAppDistFile = require.resolve('@altairgraphql/app'); // should resolve to <altair-dir>/dist/browser/main.js
const distSrc = path.join(altairAppDistFile, '..'); // From the altair-app dist/browser folder
const distDestination = path.join(__dirname, '../build/dist'); // To altair-static dist folder
deleteFolderRecursive(distDestination);
fs.mkdirSync(distDestination, { recursive: true });

const srcDir = path.resolve(__dirname, '../src');
const buildDir = path.resolve(__dirname, '../build');

const indexHtmlFile = path.join(distDestination, 'index.html');

// const cdnFile = fileName => `https://cdn.jsdelivr.net/npm/altair-static/dist/${fileName}`;

/**
 * Copy dist files into dist directory.
 * Set base to ./
 * Set the scripts and styles in template.html
 * Add template.html to dist directory.
 */
ncp(distSrc, distDestination, function (err) {
  if (err) {
    console.error(err);
    throw err;
  }
  console.log('Done copying dist folder!');

  // let indexHtmlStr = fs.readFileSync(indexHtmlFile, 'utf8');

  // Adjust the base URL to be relative to the current path
  // indexHtmlStr = indexHtmlStr.replace('<base href="/">', '<base href="https://cdn.jsdelivr.net/npm/altair-static/dist/">'
  // /*'<base href="./">'*/);

  // Write the new string back to file
  // fs.writeFileSync(indexHtmlFile, indexHtmlStr, 'utf8');

  try {
    const stats = JSON.parse(
      fs.readFileSync(path.resolve(distSrc, '..', 'stats.json'))
    );

    const htmlString = fs
      .readFileSync(path.resolve(srcDir, 'index.html'), 'utf8')
      // Set base to ./
      .replace('<base href="/">', '<base href="./">')
      .replace(
        `<!-- [PRELOAD_MODULES] -->`,
        stats.outputs['main.js'].imports
          .filter((imp) => imp.kind === 'import-statement')
          .map((imp) => `<link rel="modulepreload" href="${imp.path}">`)
          .join('')
      )
      // Set scripts and styles
      .replace('[% STYLES_FILE %]', stats?.assetsByChunkName?.styles || 'styles.css')
      .replace(
        '[% RUNTIME_SCRIPT %]',
        stats?.assetsByChunkName?.runtime || 'runtime.js'
      )
      .replace(
        '[% POLYFILLS_SCRIPT %]',
        stats?.assetsByChunkName?.polyfills || 'polyfills.js'
      )
      .replace('[% MAIN_SCRIPT %]', stats?.assetsByChunkName?.main || 'main.js');

    fs.writeFileSync(path.join(distDestination, 'index.html'), htmlString);

    // Remove stats.json after writing index.html file (the file is too big and not useful anymore)
    // fs.unlinkSync(path.resolve(distDestination, 'stats.json'));

    // Remove README assets
    deleteFolderRecursive(path.join(distDestination, 'assets/img/readme'));
  } catch (err) {
    console.error('stats.json not found', err);
  }
});
