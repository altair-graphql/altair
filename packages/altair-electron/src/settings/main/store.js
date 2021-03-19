const ElectronStore = require('electron-store');
const { settingsStoreFileName } = require('../constants');

const store = new ElectronStore({
  name: settingsStoreFileName,
});

module.exports = store;
