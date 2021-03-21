const { ipcMain } = require('electron');
const settingsStore = require('./store');
const { SETTINGS_STORE_EVENTS } = require('../constants');
const initSettingsStoreEvents = () => {

  ipcMain.on(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA, (e) => {
    e.returnValue = settingsStore.get('settings');
  });

  ipcMain.on(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, (e, value) => {
    e.returnValue = settingsStore.set('settings', value);
  });
};

module.exports = {
  initSettingsStoreEvents,
};
