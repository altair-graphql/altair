import { ipcMain, IpcRenderer, WebContents } from 'electron';
import { store } from './store';
import { autoUpdater } from 'electron-updater';
import {
  IPC_EVENT_NAMES,
  SETTINGS_STORE_EVENTS,
} from '@altairgraphql/electron-interop';

export const initSettingsStoreEvents = () => {
  ipcMain.on(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA, e => {
    e.returnValue = store.get('settings');
  });

  ipcMain.on(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, (e, value) => {
    e.returnValue = store.set('settings', value);
  });
};

export const initUpdateAvailableEvent = (webContent: WebContents) => {
  autoUpdater.on('update-available', () => {
    webContent.send(IPC_EVENT_NAMES.UPDATE_AVAILABLE);
  });
  ipcMain.on(IPC_EVENT_NAMES.RENDERER_UPDATE_APP, () => {
    autoUpdater.downloadUpdate();
  });
};
