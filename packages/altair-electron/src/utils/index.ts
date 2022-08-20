/* eslint-disable no-sync */
import { readdir } from "fs";
import fs from "fs";
import { join } from "path";
import { ipcMain } from "electron";

export const getDirectoriesInDirectory = (path: string) => {
  return new Promise<string[]>((resolve, reject) => {
    readdir(path, { withFileTypes: true }, (err, dirents) =>
      err
        ? reject(err)
        : resolve(
            dirents
              .filter((dirent) => dirent.isDirectory())
              .map((dirent) => dirent.name)
          )
    );
  });
};

export const deleteFolderRecursive = (path: string) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
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

const encodeError = (e: Error) => {
  return { name: e.name, message: e.message, extra: { ...e } };
};

export const handleWithCustomErrors = (
  channel: string,
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
) => {
  ipcMain.handle(channel, async (...args) => {
    try {
      return { result: await Promise.resolve(handler(...args)) };
    } catch (e: any) {
      return { error: encodeError(e) };
    }
  });
};
