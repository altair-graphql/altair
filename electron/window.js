const { BrowserWindow, protocol, ipcMain, session, app } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const mime = require('mime-types');

const { createMenu } = require('./menu');
const { createTouchBar } = require('./touchbar');
const { checkForUpdates } = require('./updates');

let instance = null;

const headersToSet = [ 'Origin' ];
let requestHeaders = {};

const actions = {
  createTab: () => {
    console.log('Create tab.');
    instance.webContents.send('create-tab', true);
  },
  closeTab: () => {
    console.log('Close tab.');
    instance.webContents.send('close-tab', true);
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

    const requestDirectory = path.resolve(app.getAppPath(), 'dist');
    const filePath = path.join(requestDirectory, new url.URL(request.url).pathname);
    const indexPath = path.join(requestDirectory, 'index.html');

    getFilePath(filePath).then((filePath) => {
      if (!filePath) {
        filePath = indexPath;
      }

      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
          return console.log('Error loading file to buffer.', err);
        }

        // Load the data from the file into a buffer and pass it to the callback
        // Using the mime package to get the mime type for the file, based on the file name
        callback({ mimeType: mime.lookup(filePath), data: new Buffer(data) });
      });
    });
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  });

  // Create the browser window.
  instance = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      webSecurity: false
    },
    // titleBarStyle: 'hidden-inset'
  });

  // Populate the application menu
  createMenu(actions);

  // and load the index.html of the app.
  instance.loadURL(url.format({
    pathname: '-',
    protocol: 'altair:',
    slashes: true
  }));

  // Open the DevTools.
  // instance.webContents.openDevTools();

  // Set the touchbar
  instance.setTouchBar(createTouchBar(actions));

  // Prevent the app from navigating away from the app
  instance.webContents.on('will-navigate', (e, url) => e.preventDefault());

  // Emitted when the window is closed.
  instance.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    instance = null;
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Set the request headers
    Object.keys(requestHeaders).forEach(key => {
      details.requestHeaders[key] = requestHeaders[key];
    });
    callback({
      cancel: false,
      requestHeaders: details.requestHeaders
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
};

const getInstance = () => instance;

module.exports = {
  getInstance,
  instance,
  createWindow,
  actions
};
