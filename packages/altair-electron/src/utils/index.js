const { readdir } = require('fs');
const fs = require('fs');
const { join } = require('path');

const getDirectoriesInDirectory = (path) => {
  return new Promise((resolve, reject) => {
    readdir(
      path,
      { withFileTypes: true },
      (err, dirents) => err ? reject(err) : resolve(dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)));
  });
};

const deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = {
  getDirectoriesInDirectory,
  deleteFolderRecursive,
};
