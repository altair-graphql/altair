const { app, Menu } = require('electron');

const createMenu = (actions) => {
  const template = [
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
      { role: "minimize" },
      { type: "separator" },
      { role: "front" }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports = {
  createMenu
};
