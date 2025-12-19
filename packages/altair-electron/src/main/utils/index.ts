/* eslint-disable no-sync */
import fs, { readdir } from 'fs';
import { join } from 'path';
import { App, ipcMain } from 'electron';
import { ALTAIR_CUSTOM_PROTOCOL } from '@altairgraphql/electron-interop';

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
  return join(__dirname, '../../static');
};

const encodeError = (e: Error) => {
  return { name: e.name, message: e.message, extra: { ...e } };
};

export const handleWithCustomErrors = (
  channel: string,
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => unknown
) => {
  ipcMain.handle(channel, async (...args) => {
    try {
      return { result: await Promise.resolve(handler(...args)) };
    } catch (e) {
      if (e instanceof Error) {
        return { error: encodeError(e) };
      }
      return { error: { name: 'unknown error', message: 'unknown error' } };
    }
  });
};

// We don't know the exact position of the URL is in argv. Chromium might inject its own arguments
// into argv. See https://www.electronjs.org/docs/latest/api/app#event-second-instance.
export function findCustomProtocolUrlInArgv(argv: string[]) {
  return argv.find((arg) => arg.startsWith(`${ALTAIR_CUSTOM_PROTOCOL}://`));
}

export function restartApp(app: App) {
  app.relaunch();
  app.exit();
}
