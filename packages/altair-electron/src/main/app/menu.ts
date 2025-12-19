import { app, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { ActionManager } from './actions';
import {
  getDisableHardwareAcceleration,
  setDisableHardwareAcceleration,
} from '../utils/startup';
import { restartApp } from '../utils';

export class MenuManager {
  constructor(private actionManager: ActionManager) {
    Menu.setApplicationMenu(this.createMenu());
  }

  createMenu() {
    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
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
          ...(isMac
            ? ([
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
              ] as MenuItemConstructorOptions[])
            : []),
          { type: 'separator' },
          { role: 'quit' },
        ],
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
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          ...(isMac
            ? ([
                { type: 'separator' },
                {
                  label: 'Speech',
                  submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
                },
              ] as MenuItemConstructorOptions[])
            : []),
        ],
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
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        role: 'window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          getDisableHardwareAcceleration()
            ? {
                label: 'Enable hardware acceleration (beta)',
                click: () => {
                  setDisableHardwareAcceleration(false);
                  restartApp(app);
                },
              }
            : {
                label: 'Disable hardware acceleration (beta)',
                click: () => {
                  setDisableHardwareAcceleration(true);
                  restartApp(app);
                },
              },
          ...(isMac
            ? ([
                { role: 'minimize' },
                { type: 'separator' },
                { role: 'front' },
              ] as const)
            : ([{ role: 'about' }] as const)),
        ],
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
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Open documentation',
            click: async () => {
              await shell.openExternal('https://altairgraphql.dev/docs/');
            },
          },
        ],
      },
    ];

    return Menu.buildFromTemplate(template);
  }
}
