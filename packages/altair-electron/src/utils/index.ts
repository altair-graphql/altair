/* eslint-disable no-sync */
import { readdir } from "fs";
import fs from "fs";
import { join } from "path";

export const getDirectoriesInDirectory = (path: string) => {
  return new Promise<string[]>((resolve, reject) => {
    readdir(path, { withFileTypes: true }, (err, dirents) =>
      err
        ? reject(err)
        : resolve(
            dirents
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name)
          )
    );
  });
};

export const deleteFolderRecursive = (path: string) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const curPath = join(path, file);
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

export const getStaticDirectory = () => {
  return join(__dirname, "../../static");
};
