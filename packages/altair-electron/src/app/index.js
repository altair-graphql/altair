// @ts-check
const { app, protocol } = require('electron');
const { readFile } = require('fs');
const isDev = require('electron-is-dev');
// const { createWindow, getInstance } = require('../window');
const { setupAutoUpdates } = require('../updates');
const { InMemoryStore } = require('../store');
const WindowManager = require('./window');

class ElectronApp {

  start() {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      console.log('An instance already exists.');
      return app.quit();
    }
    this.store = new InMemoryStore();
    this.windowManager = new WindowManager(this);

    protocol.registerSchemesAsPrivileged([
      { scheme: 'altair', privileges: { standard: true, secure: true, corsEnabled: true, supportFetchAPI: true } }
    ]);

    this.manageEvents();
  }

  manageEvents() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      this.windowManager.createWindow();
      if (!isDev) {
        setupAutoUpdates();
      }
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (!this.windowManager.getInstance()) {
        this.windowManager.createWindow();
      }
    });

    app.on('will-finish-launching', () => {
      app.on('open-file', (ev, path) => {
        readFile(path, 'utf8', (err, data) => {
          if (err) {
            return;
          }
          const instance = this.windowManager.getInstance();

          if (instance) {
            instance.webContents.send('file-opened', data);
          }

          this.store.set('file-opened', data);
        });
      });
    });

    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      event.preventDefault();
      callback(true);
      // Inform user of invalid certificate
      webContents.send('certificate-error', error);
    });

    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (e, navigationUrl) => {
        // Ask the operating system to open this event's url in the default browser.
        e.preventDefault();

        const { shell } = require('electron');
        shell.openExternalSync(navigationUrl);
      });
    });
  }
}

module.exports = ElectronApp;
