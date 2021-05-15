// @ts-check
const { importBackupData, exportBackupData } = require('../utils/backup');
const { checkForUpdates } = require('../updates');
const { BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

class ActionManager {
  /**
   * @param {Electron.BrowserWindow} windowInstance window instance
   */
  constructor(windowInstance) {
    this.windowInstance = windowInstance;
  }

  createTab() {
    this.windowInstance.webContents.send('create-tab', true);
  }

  closeTab() {
    this.windowInstance.webContents.send('close-tab', true);
  }

  nextTab() {
    this.windowInstance.webContents.send('next-tab', true);
  }

  previousTab() {
    this.windowInstance.webContents.send('previous-tab', true);
  }

  reopenClosedTab() {
    this.windowInstance.webContents.send('reopen-closed-tab', true);
  }

  sendRequest() {
    this.windowInstance.webContents.send('send-request', true);
  }

  reloadDocs() {
    this.windowInstance.webContents.send('reload-docs', true);
  }

  showDocs() {
    this.windowInstance.webContents.send('show-docs', true);
  }

  showSettings() {
    this.windowInstance.webContents.send('show-settings', true);
  }

  importAppData() {
    importBackupData(this.windowInstance);
  }

  exportAppData() {
    this.windowInstance.webContents.send('export-app-data', true);
  }

  checkForUpdates(menuItem) {
    return checkForUpdates(menuItem);
  }

  showPreferences() {
    const prefWindow = new BrowserWindow({
      width: 600,
      height: 600,
      minWidth: 500,
      minHeight: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
      // acceptFirstMouse: true,
      // titleBarStyle: 'hidden',
    });

    // and load the index.html of the app.
    return prefWindow.loadURL(url.format({
      pathname: path.resolve(__dirname, '../settings/renderer/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
}

module.exports = ActionManager;
