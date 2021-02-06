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
const { initMainProcessStoreEvents } = require('../electron-store-adapter/main-store-events');

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
        enableRemoteModule: process.env.NODE_ENV === 'test', // remote required for spectron tests to work
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
    this.instance.setTouchBar(this.touchbarManager.createTouchBar());

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

    initMainProcessStoreEvents();

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

      // console.log('sending headers', details.requestHeaders);
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

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      // console.log('received headers..', details.responseHeaders);
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

    ipcMain.handle('reload-window', (e) => {
      e.sender.reload();
    });
  }

  registerProtocol() {

    try {
      /**
       * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
       */
      protocol.registerBufferProtocol('altair', (request, callback) => {

        const requestDirectory = getDistDirectory();
        const originalFilePath = path.join(requestDirectory, new url.URL(request.url).pathname);
        const indexPath = path.join(requestDirectory, 'index.html');

        this.getFileContentData(originalFilePath, indexPath).then(({ mimeType, data }) => {
          callback({ mimeType, data });
        }).catch(err => {
          throw err;
        });
      });
    } catch (error) {
      error.message = `Failed to register protocol. ${error.message}`;
      console.error(error);
    }
  }

  /**
   * @param {string} filePath path to file
   */
  getFilePath(filePath) {
    console.log('file..', filePath);
    return new Promise((resolve, reject) => {
      try {
        if (!filePath) {
          return resolve();
        }

        if (filePath.endsWith('.map')) {
          return resolve(filePath);
        }

        // console.log('checking stat..', filePath);
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

  /**
   * @param {string} originalFilePath path to file
   * @param {string} fallbackPath usually path to index file
   */
  getFileContentData(originalFilePath, fallbackPath) {
    return new Promise((resolve, reject) => {
      this.getFilePath(originalFilePath).then(filePath => {
        if (!filePath) {
          filePath = fallbackPath;
        }
        if (filePath && filePath.endsWith('.map')) {
          return resolve({ mimeType: 'text/plain', data: Buffer.from('{"version": 3, "file": "index.module.js", "sources": [], "sourcesContent": [], "names": [], "mappings":""}') });
        }
        fs.readFile(filePath, 'utf8', function (err, data) {
          if (err) {
            console.log('Error loading file to buffer.', filePath, err);
            return reject(err);
          }

          if (filePath && filePath.includes('index.html')) {
            data = renderAltair();
          }

          // Load the data from the file into a buffer and pass it to the callback
          // Using the mime package to get the mime type for the file, based on the file name
          return resolve({ mimeType: mime.lookup(filePath) || '', data: Buffer.from(data) });
        });
      });
    });
  }
}

module.exports = WindowManager;
