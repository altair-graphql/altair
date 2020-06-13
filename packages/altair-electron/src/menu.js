const { app, Menu } = require('electron');

const createMenu = (actions) => {
  const isMac = process.platform === 'darwin';

  const template = [
    ...( isMac ? [{
      label: app.getName(),
      submenu: [
        { role: "about" },
        { label: 'Check for Updates...', click: actions.checkForUpdates },
        {
          label: 'Preferences',
          accelerator: 'Cmd+,',
          click: actions.showSettings
        },
        { type: "separator" },
        { role: "services", submenu: [] },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    }] : []),
    {
      label: "Edit",
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: actions.createTab
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: actions.closeTab
        },
        {
          label: 'Reopen Closed Tab',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: actions.reopenClosedTab
        },
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" },
        ...(isMac ? [
          { type: "separator" },
          {
            label: "Speech",
            submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
          }
        ] : [])
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: 'Next Tab',
          accelerator: 'Ctrl+Tab',
          click: actions.nextTab
        },
        {
          label: 'Previous Tab',
          accelerator: 'Ctrl+Shift+Tab',
          click: actions.previousTab
        },
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
        { role: "close" },
        ...(isMac ? [
          { role: "minimize" },
          { type: "separator" },
          { role: "front" }
        ] : [
          { role: 'about' },
        ]),
      ]
    },
    {
      label: "Data",
      submenu: [
        {
          label: 'Export data...',
          click: actions.exportAppData,
        },
        {
          label: 'Restore data...',
          click: actions.importAppData,
        },
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open documentation',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://altair.sirmuel.design/docs/');
          }
        }
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports = {
  createMenu
};
