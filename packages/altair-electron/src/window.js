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

const { getStore } = require('./store');
const { createMenu } = require('./menu');
const { createTouchBar } = require('./touchbar');
const { checkForUpdates } = require('./updates');
const { checkMultipleDataVersions } = require('./utils/check-multi-data-versions');
const { importBackupData, exportBackupData } = require('./utils/backup');

/**
 * @type {BrowserWindow}
 */
let instance = null;

const headersToSet = [ 'Origin', 'Cookie' ];
let requestHeaders = {};

const actions = {
  createTab: () => {
    instance.webContents.send('create-tab', true);
  },
  closeTab: () => {
    instance.webContents.send('close-tab', true);
  },
  nextTab: () => {
    instance.webContents.send('next-tab', true);
  },
  previousTab: () => {
    instance.webContents.send('previous-tab', true);
  },
  reopenClosedTab: () => {
    instance.webContents.send('reopen-closed-tab', true);
  },
  sendRequest: () => {
    instance.webContents.send('send-request', true);
  },
  reloadDocs: () => {
    instance.webContents.send('reload-docs', true);
  },
  showDocs: () => {
    instance.webContents.send('show-docs', true);
  },
  showSettings: () => {
    instance.webContents.send('show-settings', true);
  },
  importAppData: () => {
    return importBackupData(instance);
  },
  exportAppData: () => {
    return exportBackupData(instance);
  },
  checkForUpdates,
};

const createWindow = () => {

  const getFilePath = (filePath) => {
    return new Promise((resolve, reject) => {

      if (!filePath) {
        return resolve();
      }

      console.log('checking stat..', filePath);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats.isFile()) {
          return resolve(filePath);
        }

        if (stats.isDirectory()) {
          return resolve(getFilePath(path.join(filePath, 'index.html')));
        }

        return resolve();
      });
    });
  };

  /**
   * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
   */
  protocol.registerBufferProtocol('altair', (request, callback) => {

    const requestDirectory = getDistDirectory();
    const filePath = path.join(requestDirectory, new url.URL(request.url).pathname);
    const indexPath = path.join(requestDirectory, 'index.html');

    getFilePath(filePath).then((filePath) => {
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
        callback({ mimeType: mime.lookup(filePath), data: Buffer.from(data) });
      });
    });
  }, (error) => {
    if (error) console.error('Failed to register protocol');
  });

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800
  });

  // Create the browser window.
  instance = new BrowserWindow({
    show: false, // show when ready
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
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
      preload: path.join(__dirname, 'preload', 'index.js'),
    },
    // titleBarStyle: 'hidden-inset'
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(instance);

  // Populate the application menu
  createMenu(actions);

  // and load the index.html of the app.
  instance.loadURL(url.format({
    pathname: '-',
    protocol: 'altair:',
    slashes: true
  }));
  // instance.loadURL('http://localhost:4200/');

  // Set the touchbar
  instance.setTouchBar(createTouchBar(actions));

  // Prevent the app from navigating away from the app
  instance.webContents.on('will-navigate', (e, url) => e.preventDefault());

  // instance.webContents.once('dom-ready', () => {
  //   instance.webContents.openDevTools();
  // });

  instance.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
      // Ask the operating system to open this event's url in the default browser.
      event.preventDefault();

      shell.openExternalSync(navigationUrl);
    })
  });

  // Emitted when the window is closed.
  instance.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    instance = null;
  });

  instance.on('ready-to-show', () => {
    instance.show();
    instance.focus();
    checkMultipleDataVersions(instance);
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
    // Set defaults
    details.requestHeaders['Origin'] = 'electron://altair';

    // Set the request headers
    Object.keys(requestHeaders).forEach(key => {
      details.requestHeaders[key] = requestHeaders[key];
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
    requestHeaders = {};

    headers.forEach(header => {
      if (headersToSet.includes(header.key) && header.key && header.value) {
        requestHeaders[header.key] = header.value;
      }
    });

    e.returnValue = true;
  });

  // Listen for the `get-file-opened` instruction,
  // then retrieve the opened file from the store and send it to the instance.
  // Then remove it from the store
  ipcMain.on('get-file-opened', () => {
    var store = getStore();
    var openedFileContent = store.get('file-opened');
    if (!openedFileContent) {
      return;
    }

    instance.webContents.send('file-opened', openedFileContent);
    store.delete('file-opened');
  });
};

const getInstance = () => instance;

module.exports = {
  getInstance,
  instance,
  createWindow,
  actions
};
