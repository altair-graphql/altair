const { ipcMain } = require('electron');
const settingsStore = require('./store');
const { SETTINGS_STORE_EVENTS } = require('../constants');
const { autoUpdater } = require('electron-updater');
const { update } = require('../../updates');
const initSettingsStoreEvents = () => {

  ipcMain.on(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA, (e) => {
    e.returnValue = settingsStore.get('settings');
  });

  ipcMain.on(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, (e, value) => {
    e.returnValue = settingsStore.set('settings', value);
  });
};

const initUpdateAvailableEvent = (ipc) => {
  autoUpdater.on('update-not-available', () => {
    ipc.send('update-available');
  });
  ipcMain.on('update', () => {
    update();
  });
};

module.exports = {
  initSettingsStoreEvents,
  initUpdateAvailableEvent,
};
