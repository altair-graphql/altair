const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

ncp.limit = 16;

const distSrc = path.join(__dirname, '../../../dist'); // From the main altair dist folder
const distDestination = path.join(__dirname, '../build/dist'); // To altair-static dist folder
if (!fs.existsSync(distDestination)){
  fs.mkdirSync(distDestination);
}

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
      .replace('[% INLINE_SCRIPT %]', stats.assetsByChunkName.inline)
      .replace('[% POLYFILLS_SCRIPT %]', stats.assetsByChunkName.polyfills)
      .replace('[% MAIN_SCRIPT %]', stats.assetsByChunkName.main);

    fs.writeFileSync(path.join(distDestination, 'index.html'), htmlString);

  } catch(err) {
    console.error('stats.json not found', err);
  }
});
