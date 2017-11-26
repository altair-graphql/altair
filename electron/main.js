const {app, protocol } = require('electron');
const isDev = require('electron-is-dev');
const { setupAutoUpdates } = require('./updates');
const { instance, createWindow } = require('./window');

// Default Squirrel.Windows event handler for your Electron apps.
// if (require('electron-squirrel-startup')) return; // Not required when using NSIS target

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = instance;

protocol.registerStandardSchemes(['altair']);

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
  if (instance === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
