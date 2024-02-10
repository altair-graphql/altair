const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

ncp.limit = 16;

const deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
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
const altairAppDistFile = require.resolve('@altairgraphql/electron-settings'); // should resolve to <altair-dir>/dist/main.js
const distSrc = path.join(altairAppDistFile, '..'); // From the altair-electron-settings dist folder
const distDestination = path.join(__dirname, '../build/dist'); // To altair-static dist folder
deleteFolderRecursive(distDestination);
fs.mkdirSync(distDestination, { recursive: true });

// const cdnFile = fileName => `https://cdn.jsdelivr.net/npm/altair-static/dist/${fileName}`;

/**
 * Copy dist files into dist directory.
 * Set base to ./
 * Set the scripts and styles in template.html
 * Add template.html to dist directory.
 */
ncp(distSrc, distDestination, function(err) {
  if (err) {
    console.error(err);
    throw err;
  }
  console.log('Done copying dist folder!');
});
