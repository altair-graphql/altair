import fs from 'fs';
import { app, dialog, MenuItem } from 'electron';

import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// const server = 'https://hazel-server-gufzwmrois.now.sh';
// const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

// const CHECK_UPDATE_INTERVAL = 1000 * 60 * 15; // every 15 mins

let updater: MenuItem | undefined;
let isSilentCheck = true;
autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
  dialog.showErrorBox(
    'Error: ',
    !error ? 'unknown' : (error.stack || error).toString()
  );
});

autoUpdater.on('update-not-available', () => {
  if (!isSilentCheck) {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.',
    });
  }
  if (updater) {
    updater.enabled = true;
    updater = undefined;
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox({
      title: 'Install Updates',
      message: 'Updates downloaded, application will now exit to update.',
    })
    .then(() => {
      setImmediate(() => autoUpdater.quitAndInstall());
    });
});

const canUpdate = () => {
  // app.isPackaged does not work well (see #2114)
  // TODO: Figure out how to resolve the protected app access error
  const _au: any = autoUpdater;
  // Don't check for updates if update config is not found (auto-update via electron is not supported)
  return (
    _au.app &&
    _au.app.appUpdateConfigPath &&
    fs.existsSync(_au.app.appUpdateConfigPath)
  );
};

export const setupAutoUpdates = () => {
  if (!canUpdate()) {
    return;
  }

  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  // autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdates().catch((err) => console.error(err));
};

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'Install Updates',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail: 'A new version has been downloaded. Restart the application to apply the updates.'
//   };

//   dialog.showMessageBox(dialogOpts, (response) => {
//     if (response === 0) {
//       autoUpdater.quitAndInstall();
//     }
//   });
// });

export const checkForUpdates = (menuItem: MenuItem) => {
  if (!canUpdate()) {
    return;
  }

  if (menuItem) {
    updater = menuItem;
    updater.enabled = false;
  }
  isSilentCheck = false;
  autoUpdater.checkForUpdates().catch((err) => console.error(err));
};
