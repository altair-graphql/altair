const fs = require('fs');
const { dialog } = require('electron');

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// const server = 'https://hazel-server-gufzwmrois.now.sh';
// const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

// const CHECK_UPDATE_INTERVAL = 1000 * 60 * 15; // every 15 mins

let updater = null;
let isSilentCheck = true;
autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', !!error === null ? 'unknown' : (error.stack || error).toString());
});

autoUpdater.on('update-not-available', () => {
  if (!isSilentCheck) {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    });
  }
  if (updater) {
    updater.enabled = true;
    updater = null;
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will now exit to update.'
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall());
  });
});

const canUpdate = () => {
  // Don't check for updates if update config is not found (auto-update via electron is not supported)
  return autoUpdater.app
    && autoUpdater.app.appUpdateConfigPath
    && fs.existsSync(autoUpdater.app.appUpdateConfigPath);
};

const setupAutoUpdates = () => {
  if (!canUpdate()) {
    return;
  }

  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  // autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdates();
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

const checkForUpdates = (menuItem) => {
  if (!canUpdate()) {
    return;
  }

  if (menuItem) {
    updater = menuItem;
    updater.enabled = false;
  }
  isSilentCheck = false;
  autoUpdater.checkForUpdates();
};

const update = () => {
  autoUpdater.on('update-available', () => {
    autoUpdater.downloadUpdate();
  });
};


module.exports = {
  setupAutoUpdates,
  checkForUpdates,
  update
};
