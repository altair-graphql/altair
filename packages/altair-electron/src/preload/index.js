/**
 * Preload script
 * Executed before other scripts on the window.
 * Has access to Node APIs.
 * Can be used to provide data to renderer process without exposing Node APIs to it.
 */

// Set a variable in the page before it loads
// webFrame.executeJavaScript('window.foo = "foo";');

// The loaded page will not be able to access this, it is only available
// in this context
// window.bar = 'bar'

window.ipc = require('electron').ipcRenderer;
const { getCurrentWindow } = require('electron').remote;
const ElectronStoreAdapter = require('../electron-store-adapter/electron-store-adapter');

const reload = () => {
  getCurrentWindow().reload();
}

process.once('loaded', () => {
  // Giving access to spectron to run tests successfully
  if (process.env.NODE_ENV === 'test') {
    window.electronRequire = require;
  }
  
  // console.log(allStorage());
  const store = new ElectronStoreAdapter();
  // Check if data is stored in electron store
  if (!store.length) {
    // Else, copy content of localstorage into electron store and reload.
    Object.keys(localStorage).forEach(key => {
      store.setItem(key, localStorage.getItem(key));
    });
    return reload();
  }
  // If so, then add electron localstorage to window and continue
  global.electronLocalStorage = store;
  global.localStorage = store;
});
