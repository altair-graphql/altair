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

// Giving access to spectron to run tests successfully
if (process.env.NODE_ENV === 'test') {
  window.electronRequire = require;
}
