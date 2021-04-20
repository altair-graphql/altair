const unhandled = require('electron-unhandled');
const ElectronApp = require('./src/app');

const app = new ElectronApp();
app.start();
unhandled({ showDialog: false });
