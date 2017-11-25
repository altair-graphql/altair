const {app, BrowserWindow, protocol, remote, Menu } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const mime = require('mime-types');
const isDev = require('electron-is-dev');
const { setupAutoUpdates } = require('./updates');

// Default Squirrel.Windows event handler for your Electron apps.
// if (require('electron-squirrel-startup')) return; // Not required when using NSIS target

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {

  /**
   * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
   */
  protocol.registerBufferProtocol('altair', (request, callback) => {
    let url = request.url.substr(7);

    // In windows, the url comes as altair://c/Users/Jackie/Documents/projects/altair/dist/index.html
    // We also need to strip out the //c from the path
    // TODO - Find a better way of handling this
    if (process.platform === 'win32') {
      url = request.url.substr(10);
    }

    // Maybe this could work?
    // console.log('::>>', path.join(__dirname, '../dist', path.basename(request.url)));

    fs.readFile(path.normalize(`${url}`), 'utf8', function (err, data) {
      if (err) {
        return console.log('Error loading file to buffer.', err);
      }

      // Load the data from the file into a buffer and pass it to the callback
      // Using the mime package to get the mime type for the file, based on the file name
      callback({ mimeType: mime.lookup(url), data: new Buffer(data) });
      // console.log(data);
    });
    // callback({path: path.normalize(`${__dirname}/${url}`)})
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  });

  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      webSecurity: false
    },
    // titleBarStyle: 'hidden-inset'
  });

  // Populate the application menu
  createMenu();

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'altair:',
    slashes: true
  }));
  // win.loadURL('altair://' + __dirname + '/../dist/index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Prevent the app from navigating away from the app
  win.webContents.on('will-navigate', (e, url) => e.preventDefault());

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  })
}

function createMenu() {
  const template = [
    {
      label: "Edit",
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => console.log('Create tab.')
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => console.log('Close tab.')
        },
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      role: "window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    }
  ];

  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services", submenu: [] },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    });

    // Edit menu
    template[1].submenu.push(
      { type: "separator" },
      {
        label: "Speech",
        submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
      }
    );

    // Window menu
    template[3].submenu = [
      { role: "close" },
      { role: "minimize" },
      { type: "separator" },
      { role: "front" }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

protocol.registerStandardSchemes(['altair']);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  if (!isDev) {
    setupAutoUpdates();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
