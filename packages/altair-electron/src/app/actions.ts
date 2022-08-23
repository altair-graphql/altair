import { importBackupData } from "../utils/backup";
import { checkForUpdates } from "../updates";
import { BrowserWindow, MenuItem } from "electron";
import url from "url";
import path from "path";
import { getStaticDirectory } from "../utils";

export class ActionManager {
  constructor(private windowInstance: BrowserWindow) {}

  createTab() {
    this.windowInstance.webContents.send("create-tab", true);
  }

  closeTab() {
    this.windowInstance.webContents.send("close-tab", true);
  }

  nextTab() {
    this.windowInstance.webContents.send("next-tab", true);
  }

  previousTab() {
    this.windowInstance.webContents.send("previous-tab", true);
  }

  reopenClosedTab() {
    this.windowInstance.webContents.send("reopen-closed-tab", true);
  }

  sendRequest() {
    this.windowInstance.webContents.send("send-request", true);
  }

  reloadDocs() {
    this.windowInstance.webContents.send("reload-docs", true);
  }

  showDocs() {
    this.windowInstance.webContents.send("show-docs", true);
  }

  showSettings() {
    this.windowInstance.webContents.send("show-settings", true);
  }

  importAppData() {
    importBackupData(this.windowInstance);
  }

  exportAppData() {
    this.windowInstance.webContents.send("export-app-data", true);
  }

  checkForUpdates(menuItem: MenuItem) {
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
        contextIsolation: false
      }
      // acceptFirstMouse: true,
      // titleBarStyle: 'hidden',
    });

    // and load the index.html of the app.
    return prefWindow.loadURL(
      url.format({
        pathname: path.resolve(getStaticDirectory(), "settings/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }
}
