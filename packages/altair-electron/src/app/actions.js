// @ts-check
const { importBackupData, exportBackupData } = require('../utils/backup');
const { checkForUpdates } = require('../updates');

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
    return importBackupData(this.windowInstance);
  }

  exportAppData() {
    return exportBackupData(this.windowInstance);
  }

  checkForUpdates() {
    return checkForUpdates();
  }
}

module.exports = ActionManager;
