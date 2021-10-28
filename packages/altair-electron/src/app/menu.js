
// @ts-check
const { app, Menu } = require('electron');

class MenuManager {
  /**
   * @param {import('./actions')} actionManager action manager
   */
  constructor(actionManager) {
    this.actionManager = actionManager;
    Menu.setApplicationMenu(this.createMenu());
  }

  createMenu() {
    const isMac = process.platform === 'darwin';

    const template = [
      {
        label: app.getName(),
        submenu: [
          { role: 'about' },
          {
            label: 'Check for Updates...',
            click: (menuItem) => this.actionManager.checkForUpdates(menuItem),
          },
          {
            label: 'Preferences',
            accelerator: 'Cmd+,',
            click: () => this.actionManager.showSettings(),
          },
          {
            label: 'Desktop settings...',
            click: () => this.actionManager.showPreferences(),
          },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
          ] : []),
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'New Tab',
            accelerator: 'CmdOrCtrl+T',
            click: () => this.actionManager.createTab(),
          },
          {
            label: 'Close Tab',
            accelerator: 'CmdOrCtrl+W',
            click: () => this.actionManager.closeTab(),
          },
          {
            label: 'Reopen Closed Tab',
            accelerator: 'CmdOrCtrl+Shift+T',
            click: () => this.actionManager.reopenClosedTab(),
          },
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' },
          ...(isMac ? [
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }]
            }
          ] : [])
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Next Tab',
            accelerator: 'Ctrl+Tab',
            click: () => this.actionManager.nextTab(),
          },
          {
            label: 'Previous Tab',
            accelerator: 'Ctrl+Shift+Tab',
            click: () => this.actionManager.previousTab(),
          },
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        role: 'window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          ...(isMac ? [
            { role: 'minimize' },
            { type: 'separator' },
            { role: 'front' }
          ] : [
            { role: 'about' },
          ]),
        ]
      },
      {
        label: 'Data',
        submenu: [
          {
            label: 'Export backup data...',
            click: () => this.actionManager.exportAppData(),
          },
          {
            label: 'Import backup data...',
            click: () => this.actionManager.importAppData(),
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

    // @ts-ignore
    return Menu.buildFromTemplate(template);
  }
}

module.exports = MenuManager;
