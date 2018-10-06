const { app, dialog } = require('electron');

const { autoUpdater } = require('electron-updater');
const log = require("electron-log");

const server = 'https://hazel-server-gufzwmrois.now.sh';
const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

const CHECK_UPDATE_INTERVAL = 1000 * 60 * 15; // every 15 mins

const setupAutoUpdates = () => {
  // autoUpdater.setFeedURL(feed);

  // setInterval(() => {
  //   autoUpdater.checkForUpdates();
  // }, CHECK_UPDATE_INTERVAL);


  // autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  //   const dialogOpts = {
  //     type: 'info',
  //     buttons: ['Restart', 'Later'],
  //     title: 'Application Update',
  //     message: process.platform === 'win32' ? releaseNotes : releaseName,
  //     detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  //   };

  //   dialog.showMessageBox(dialogOpts, (response) => {
  //     if (response === 0) {
  //       autoUpdater.quitAndInstall();
  //     }
  //   });
  // });

  // autoUpdater.on('error', message => {
  //   console.error('There was a problem updating the application');
  //   console.error(message);
  // });

  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();
};

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall());
  })
});

const checkForUpdates = (menuItem) => {
  autoUpdater.checkForUpdates();
};

module.exports = {
  setupAutoUpdates,
  checkForUpdates
};
