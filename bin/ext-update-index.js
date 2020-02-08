const path = require('path');
const fs = require('fs');
module.exports = ({ extensionFilesDir }) => {
  const indexFilePath = path.resolve(extensionFilesDir, 'index.html');
  const indexFileStr = fs.readFileSync(indexFilePath, 'utf8');
  const output = indexFileStr.replace('</body>', `<script src='js/init.js'></script></body>`);

  fs.writeFileSync(indexFilePath, output, 'utf8');
  console.log('Updated index.html');
};
