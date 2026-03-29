import { importBackupData } from '../utils/backup';
import { checkForUpdates } from '../updates';
import { BrowserWindow, MenuItem } from 'electron';
import url from 'url';
import path from 'path';
import { getDistDirectory } from '@altairgraphql/electron-settings-static';
import { WindowManager } from './window';

export class ActionManager {
  constructor(private windowManager: WindowManager) {}

  createTab() {
    this.windowManager.getInstance()?.webContents.send('create-tab', true);
  }

  closeTab() {
    this.windowManager.getInstance()?.webContents.send('close-tab', true);
  }

  nextTab() {
    this.windowManager.getInstance()?.webContents.send('next-tab', true);
  }

  previousTab() {
    this.windowManager.getInstance()?.webContents.send('previous-tab', true);
  }

  reopenClosedTab() {
    this.windowManager
      .getInstance()
      ?.webContents.send('reopen-closed-tab', true);
  }

  sendRequest() {
    this.windowManager.getInstance()?.webContents.send('send-request', true);
  }

  reloadDocs() {
    this.windowManager.getInstance()?.webContents.send('reload-docs', true);
  }

  showDocs() {
    this.windowManager.getInstance()?.webContents.send('show-docs', true);
  }

  showSettings() {
    this.windowManager.getInstance()?.webContents.send('show-settings', true);
  }

  importAppData() {
    const windowInstance = this.windowManager.getInstance();
    if (windowInstance) {
      importBackupData(windowInstance);
    }
  }

  exportAppData() {
    this.windowManager.getInstance()?.webContents.send('export-app-data', true);
  }

  checkForUpdates(menuItem: MenuItem) {
    return checkForUpdates(menuItem);
  }

  async showPreferences() {
    const prefWindow = new BrowserWindow({
      width: 600,
      height: 600,
      minWidth: 500,
      minHeight: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      // acceptFirstMouse: true,
      // titleBarStyle: 'hidden',
    });

    // and load the index.html of the app.
    try {
      return prefWindow.loadURL(
        url.format({
          // pathname: path.resolve(
          //   require.resolve('@altairgraphql/electron-settings')
          // ),
          pathname: path.resolve(getDistDirectory(), 'index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    } catch (err) {
      console.log('Error loading settings window', err);
    }
  }
}
