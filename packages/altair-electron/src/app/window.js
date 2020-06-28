// @ts-check
const {
  BrowserWindow,
  protocol,
  ipcMain,
  session,
} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const mime = require('mime-types');
const windowStateKeeper = require('electron-window-state');

const { getDistDirectory, renderAltair } = require('altair-static');

const { checkMultipleDataVersions } = require('../utils/check-multi-data-versions');

const MenuManager = require('./menu');
const ActionManager = require('./actions');
const TouchbarManager = require('./touchbar');

const HEADERS_TO_SET = [ 'Origin', 'Cookie' ];

class WindowManager {
  /**
   * @param {import('./index')} electronApp electron app
   */
  constructor(electronApp) {
    this.electronApp = electronApp;
    this.instance = null;
    this.requestHeaders = {};
  }

  getInstance() {
    return this.instance;
  }

  createWindow() {

    this.registerProtocol();

    // Load the previous state with fallback to defaults
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 800
    });

    // Create the browser window.
    this.instance = new BrowserWindow({
      show: false, // show when ready
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
      webPreferences: {
        /**
         * Disables the same-origin policy.
         * Altair would be used to make requests to different endpoints, as a developer tool.
         * Other security measures are put in place, such as CSP to ensure the app content is secure.
         */
        webSecurity: false,
        allowRunningInsecureContent: false,
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: false,
        preload: path.join(__dirname, '../preload', 'index.js'),
      },
      // titleBarStyle: 'hidden-inset'
    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    this.mainWindowState.manage(this.instance);

    // Populate the application menu
    this.actionManager = new ActionManager(this.instance);
    this.menuManager = new MenuManager(this.actionManager);
    // Set the touchbar
    this.touchbarManager = new TouchbarManager(this.actionManager);

    // and load the index.html of the app.
    this.instance.loadURL(url.format({
      pathname: '-',
      protocol: 'altair:',
      slashes: true
    }));
    // instance.loadURL('http://localhost:4200/');

    this.manageEvents();
  }

  manageEvents() {

    // Prevent the app from navigating away from the app
    this.instance.webContents.on('will-navigate', e => e.preventDefault());

    // instance.webContents.once('dom-ready', () => {
    //   instance.webContents.openDevTools();
    // });

    // Emitted when the window is closed.
    this.instance.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.instance = null;
    });

    this.instance.on('ready-to-show', () => {
      this.instance.show();
      this.instance.focus();
      checkMultipleDataVersions(this.instance);
    });

    if (process.env.NODE_ENV/* === 'test'*/) {
      session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        console.log('Before request:', details);
        if (details.uploadData) {
          details.uploadData.forEach(uploadData => {
            console.log('Data sent:', uploadData.bytes.toString());
          });
        }
        callback({
          cancel: false,
        });
      });
    }
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      // @ts-ignore
      // Set defaults
      details.requestHeaders.Origin = 'electron://altair';

      // Set the request headers
      Object.keys(this.requestHeaders).forEach(key => {
        details.requestHeaders[key] = this.requestHeaders[key];
      });
      callback({
        cancel: false,
        requestHeaders: details.requestHeaders
      });
    });

    if (process.env.NODE_ENV/* === 'test'*/) {
      session.defaultSession.webRequest.onSendHeaders((details) => {
        if (details.requestHeaders) {
          Object.keys(details.requestHeaders).forEach(headerKey => {
            console.log('Header sent:', headerKey, details.requestHeaders[headerKey]);
          });
        }
      });
    }

    // Doesn't seem to be called. Might be because of buffer protocol.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: Object.assign(
          {},
          details.responseHeaders,
          {
            // Setting CSP
            // TODO: Figure out why an error from this breaks devtools
            // 'Content-Security-Policy': [`script-src 'self' 'sha256-1Sj1x3xsk3UVwnakQHbO0yQ3Xm904avQIfGThrdrjcc='; object-src 'self';`]
          }
        )
      });
    });

    // Get 'set headers' instruction from app
    ipcMain.on('set-headers-sync', (e, headers) => {
      this.requestHeaders = {};

      headers.forEach((header) => {
        if (HEADERS_TO_SET.includes(header.key) && header.key && header.value && header.enabled) {
          this.requestHeaders[header.key] = header.value;
        }
      });

      e.returnValue = true;
    });

    // Listen for the `get-file-opened` instruction,
    // then retrieve the opened file from the store and send it to the instance.
    // Then remove it from the store
    ipcMain.on('get-file-opened', () => {
      let openedFileContent = this.electronApp.store.get('file-opened');
      if (!openedFileContent) {
        return;
      }

      this.instance.webContents.send('file-opened', openedFileContent);
      this.electronApp.store.delete('file-opened');
    });
  }

  registerProtocol() {

    /**
     * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
     */
    protocol.registerBufferProtocol('altair', (request, callback) => {

      const requestDirectory = getDistDirectory();
      const originalFilePath = path.join(requestDirectory, new url.URL(request.url).pathname);
      const indexPath = path.join(requestDirectory, 'index.html');

      this.getFilePath(originalFilePath).then(filePath => {
        if (!filePath) {
          filePath = indexPath;
        }

        fs.readFile(filePath, 'utf8', function(err, data) {
          if (err) {
            return console.log('Error loading file to buffer.', err);
          }
          if (filePath && filePath.includes('index.html')) {
            data = renderAltair();
          }

          // Load the data from the file into a buffer and pass it to the callback
          // Using the mime package to get the mime type for the file, based on the file name
          callback({ mimeType: mime.lookup(filePath) || '', data: Buffer.from(data) });
        });
      });
    }, (error) => {
      if (error) {
        console.error('Failed to register protocol');
      }
    });
  }

  /**
   * @param {string} filePath path to file
   */
  getFilePath(filePath) {
    return new Promise((resolve, reject) => {
      try {
        if (!filePath) {
          return resolve();
        }

        console.log('checking stat..', filePath);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.log('with error', err);
            return reject(err);
          }
          if (stats.isFile()) {
            return resolve(filePath);
          }

          if (stats.isDirectory()) {
            return resolve(this.getFilePath(path.join(filePath, 'index.html')));
          }

          return resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = WindowManager;
