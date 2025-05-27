import { app, protocol, session, shell, dialog } from 'electron';
import { readFile } from 'fs';
import path from 'path';
import isDev from 'electron-is-dev';
import { setupAutoUpdates } from '../updates';
import { InMemoryStore } from '../store';
import { WindowManager } from './window';
import { store } from '../settings/main/store';
import {
  ALTAIR_CUSTOM_PROTOCOL,
  IPC_EVENT_NAMES,
} from '@altairgraphql/electron-interop';
import { error, log } from '../utils/log';
import { findCustomProtocolUrlInArgv } from '../utils';

export class ElectronApp {
  store: InMemoryStore;
  windowManager: WindowManager;

  constructor() {
    this.store = new InMemoryStore();
    this.windowManager = new WindowManager(this);

    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      log('An instance already exists.');
      app.quit();
      return process.exit(0);
    }

    // https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(ALTAIR_CUSTOM_PROTOCOL, process.execPath, [
          path.resolve(process.argv[1] ?? ''),
        ]);
      }
    } else {
      app.setAsDefaultProtocolClient(ALTAIR_CUSTOM_PROTOCOL);
    }

    protocol.registerSchemesAsPrivileged([
      {
        scheme: ALTAIR_CUSTOM_PROTOCOL,
        privileges: {
          standard: true,
          secure: true,
          corsEnabled: true,
          supportFetchAPI: true,
        },
      },
    ]);

    this.manageEvents();
  }

  async manageEvents() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(async () => {
      const settings = store.get('settings');
      log(settings);
      if (settings) {
        /**
         * @type Electron.Config
         */
        const proxyConfig: Electron.ProxyConfig = {
          mode: 'direct',
        };

        switch (settings.proxy_setting) {
          case 'none':
            proxyConfig.mode = 'direct';
            break;
          case 'autodetect':
            proxyConfig.mode = 'auto_detect';
            break;
          case 'system':
            proxyConfig.mode = 'system';
            break;
          case 'pac':
            proxyConfig.mode = 'pac_script';
            proxyConfig.pacScript = settings.pac_address;
            break;
          case 'proxy_server':
            proxyConfig.mode = 'fixed_servers';
            proxyConfig.proxyRules = `${settings.proxy_host}:${settings.proxy_port}`;
            break;
          default:
        }
        await session.defaultSession.setProxy(proxyConfig);
        const proxy = await session.defaultSession.resolveProxy('http://localhost');
        log(proxy, proxyConfig);
      }
      try {
        await this.windowManager.createWindow();
      } catch (err) {
        log('Error creating window', err);
        dialog.showErrorBox(
          'Error creating window. Do you know what the issue is? Feel free to create a github issue',
          err as string
        );
        throw err;
      }

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
      if (!this.windowManager) {
        throw new Error('App not started');
      }
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (!this.windowManager.getInstance()) {
        this.windowManager.createWindow();
      }
    });

    // Handle the protocol. In this case, we choose to show an Error Box.
    app.on('open-url', (event, url) => {
      this.handleOpenUrlEvent(url);
    });
    app.on('second-instance', (event, argv) => {
      // Someone tried to run a second instance, we should focus our window.
      const windowInstance = this.windowManager.getInstance();
      if (windowInstance) {
        if (windowInstance.isMinimized()) {
          windowInstance.restore();
        }
        windowInstance.focus();
      }
      const url = findCustomProtocolUrlInArgv(argv);
      if (url) {
        this.handleOpenUrlEvent(url);
      }
    });

    app.on('will-finish-launching', () => {
      app.on('open-file', (ev, path) => {
        readFile(path, 'utf8', (err, data) => {
          if (err) {
            return;
          }
          this.windowManager.sendMessage(IPC_EVENT_NAMES.FILE_OPENED, data);
        });
      });
    });

    app.on(
      'certificate-error',
      (event, webContents, url, error, certificate, callback) => {
        event.preventDefault();
        // Inform user of invalid certificate
        webContents.send('certificate-error', error);
        dialog
          .showMessageBox({
            type: 'question',
            title: 'Invalid Certificate',
            message: `You are making a request with an invalid certificate. Do you want to continue? (URL: ${url}, Issuer: ${certificate.issuerName}, Subject: ${certificate.subjectName}, Error: ${error})`,
            buttons: ['Yes', 'No'],
          })
          .then((result) => {
            if (result.response === 0) {
              callback(true);
            } else {
              callback(false);
            }
          });
      }
    );

    app.on('web-contents-created', (event, contents) => {
      contents.setWindowOpenHandler((details) => {
        try {
          log('Opening url', details.url);
          // Ask the operating system to open this event's url in the default browser.
          const url = new URL(details.url);
          const supportedProtocols = ['http:', 'https:', 'mailto:'];
          if (!supportedProtocols.includes(url.protocol)) {
            log('Unsupported protocol', url.protocol);
            return { action: 'deny' };
          }

          // Allow popups to be opened in the app
          if (details.features.includes('popup')) {
            // session cache should be cleared for popup windows
            return {
              action: 'allow',
              overrideBrowserWindowOptions: {
                webPreferences: {
                  partition: 'popup',
                },
              },
            };
          }
          shell.openExternal(url.href);
        } catch (err) {
          log('Error opening url', err);
        }
        return { action: 'deny' };
      });
    });

    app.on('render-process-gone', (event, webContents, details) => {
      error('Render process gone', details);
    });

    app.on('child-process-gone', (event, details) => {
      error('Child process gone', details);
    });
  }

  private handleOpenUrlEvent(url: string) {
    log('App opened from url', url);

    this.windowManager.sendMessage(IPC_EVENT_NAMES.URL_OPENED, url);
  }
}
