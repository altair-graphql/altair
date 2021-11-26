const { ipcMain } = require('electron');
const settingsStore = require('./store');
const { SETTINGS_STORE_EVENTS } = require('../constants');
const { autoUpdater } = require('electron-updater');

const initSettingsStoreEvents = () => {

  ipcMain.on(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA, (e) => {
    e.returnValue = settingsStore.get('settings');
  });

  ipcMain.on(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, (e, value) => {
    e.returnValue = settingsStore.set('settings', value);
  });
};

const initUpdateAvailableEvent = (ipc) => {
  autoUpdater.on('update-available', () => {
    ipc.send('update-available');
  });
  ipcMain.on('update', () => {
    autoUpdater.downloadUpdate();
  });
};

module.exports = {
  initSettingsStoreEvents,
  initUpdateAvailableEvent,
};
