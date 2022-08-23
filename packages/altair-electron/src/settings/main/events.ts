import { ipcMain, IpcRenderer, WebContents } from "electron";
import { store } from "./store";
import { SETTINGS_STORE_EVENTS } from "../constants";
import { autoUpdater } from "electron-updater";

export const initSettingsStoreEvents = () => {
  ipcMain.on(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA, e => {
    e.returnValue = store.get("settings");
  });

  ipcMain.on(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, (e, value) => {
    e.returnValue = store.set("settings", value);
  });
};

export const initUpdateAvailableEvent = (ipc: WebContents) => {
  autoUpdater.on("update-available", () => {
    ipc.send("update-available");
  });
  ipcMain.on("update", () => {
    autoUpdater.downloadUpdate();
  });
};
