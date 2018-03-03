const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

ncp.limit = 16;

const distSrc = path.join(__dirname, '../../../dist');
const distDestination = path.join(__dirname, '../dist');

const indexHtmlFile = path.join(distDestination, 'index.html');

ncp(distSrc, distDestination, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Done copying dist folder!');

  let indexHtmlStr = fs.readFileSync(indexHtmlFile, 'utf8');

  // Adjust the base URL to be relative to the current path
  indexHtmlStr = indexHtmlStr.replace('<base href="/">', '<base href="./">');

  // Write the new string back to file
  fs.writeFileSync(indexHtmlFile, indexHtmlStr, 'utf8');
});
