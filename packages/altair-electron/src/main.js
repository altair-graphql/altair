const { app, protocol } = require('electron');
const { readFileSync, readFile } = require('fs');
const isDev = require('electron-is-dev');
const { setupAutoUpdates } = require('./updates');
const { createWindow, getInstance } = require('./window');
const { getStore } = require('./store');

// require('electron-debug')();
// try {
// 	require('electron-reloader')(module);
// } catch (err) {}

// Default Squirrel.Windows event handler for your Electron apps.
// if (require('electron-squirrel-startup')) return; // Not required when using NSIS target

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = getInstance();

console.log(protocol);
// protocol.registerStandardSchemes(['altair'], { secure: true });
protocol.registerSchemesAsPrivileged([
  { scheme: 'altair', privileges: { standard: true, secure: true, corsEnabled: true, supportFetchAPI: true } }
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
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
  if (getInstance() === null) {
    createWindow();
  }
});

app.on('will-finish-launching', function() {
  app.on('open-file', function(ev, path) {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        return;
      }
      const instance = getInstance();

      if (instance) {
        instance.webContents.send('file-opened', data);
      }

      getStore().set('file-opened', data);
    });
  });
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
  // Inform user of invalid certificate
  webContents.send('certificate-error', error);
});