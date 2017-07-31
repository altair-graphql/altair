const {app, BrowserWindow, protocol, remote } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const mime = require('mime-types');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {

    // TODO - Use the altair protocol to replace the file protocol
    protocol.registerBufferProtocol('altair', (request, callback) => {
        const url = request.url.substr(7);
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
    win = new BrowserWindow({ width: 1280, height: 800 })

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

protocol.registerStandardSchemes(['altair']);
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.