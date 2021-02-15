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
const ipc = require('electron').ipcRenderer;
window.ipc = ipc;
const ElectronStoreAdapter = require('../electron-store-adapter/electron-store-adapter');

const reload = async() => {
  await ipc.invoke('reload-window');
};

if (process.env.NODE_ENV === 'development') {
  console.log('installing devtron', require('devtron'));
  require('devtron').install();
  // eslint-disable-next-line no-underscore-dangle
  window.__devtron = { require, process };
}

process.once('loaded', () => {
  // Giving access to spectron to run tests successfully
  if (process.env.NODE_ENV === 'test') {
    window.electronRequire = require;
  }

  // console.log(allStorage());
  const store = new ElectronStoreAdapter(ipc);
  // Check if data is stored in electron store
  if (!store.length) {
    // Else, copy content of localstorage into electron store and reload.
    Object.keys(window.localStorage).forEach(key => {
      store.setItem(key, window.localStorage.getItem(key));
    });
    return reload();
  }
  // If so, then add electron localstorage to window and continue
  global.electronLocalStorage = store;
  global.localStorage = store;
});
