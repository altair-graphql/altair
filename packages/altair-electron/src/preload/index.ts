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
import { ipcRenderer as ipc } from "electron";
(window as any).ipc = ipc;
import { ElectronStoreAdapter } from "../electron-store-adapter/electron-store-adapter";

const reload = async () => {
  await ipc.invoke("reload-window");
};

if (process.env.NODE_ENV === "development") {
  console.log("installing devtron", require("devtron"));
  require("devtron").install();
  (window as any).__devtron = { require, process };
}

process.once("loaded", () => {
  // Giving access to spectron to run tests successfully
  if (process.env.NODE_ENV === "test") {
    (window as any).electronRequire = require;
  }

  // console.log(allStorage());
  const store = new ElectronStoreAdapter(ipc);
  // Check if data is stored in electron store
  if (!store.length && window.localStorage.length) {
    // Else, copy content of localstorage into electron store and reload.
    Object.keys(window.localStorage).forEach(key => {
      const val = window.localStorage.getItem(key);
      if (val) {
        store.setItem(key, val);
      }
    });
    return reload();
  }
  // If so, then add electron localstorage to window and continue
  (global as any).electronLocalStorage = store;
  (global as any).localStorage = store;
});
