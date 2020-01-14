const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

ncp.limit = 16;

const deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const distSrc = path.join(__dirname, '../node_modules/altair-app/dist'); // From the altair-app dist folder
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
    return console.error(err);
  }
  console.log('Done copying dist folder!');

  // let indexHtmlStr = fs.readFileSync(indexHtmlFile, 'utf8');

  // Adjust the base URL to be relative to the current path
  // indexHtmlStr = indexHtmlStr.replace('<base href="/">', '<base href="https://cdn.jsdelivr.net/npm/altair-static/dist/">'
    // /*'<base href="./">'*/);

  // Write the new string back to file
  // fs.writeFileSync(indexHtmlFile, indexHtmlStr, 'utf8');

  try {
    const stats = JSON.parse(fs.readFileSync(path.resolve(distSrc, 'stats.json')));

    let htmlString = fs.readFileSync(path.resolve(srcDir, 'index.html'), 'utf8')
      // Set base to ./
      .replace('<base href="/">', '<base href="./">')
      // Set scripts and styles
      .replace('[% STYLES_FILE %]', stats.assetsByChunkName.styles)
      .replace('[% RUNTIME_SCRIPT %]', stats.assetsByChunkName.runtime)
      .replace('[% POLYFILLS_SCRIPT %]', stats.assetsByChunkName.polyfills)
      .replace('[% MAIN_SCRIPT %]', stats.assetsByChunkName.main);

    fs.writeFileSync(path.join(distDestination, 'index.html'), htmlString);

    // Remove stats.json after writing index.html file (the file is too big and not useful anymore)
    fs.unlinkSync(path.resolve(distDestination, 'stats.json'));

    // Remove README assets
    deleteFolderRecursive(path.join(distDestination, 'assets/img/readme'));

  } catch(err) {
    console.error('stats.json not found', err);
  }
});
