import { BrowserWindow, app, ipcMain, protocol, session } from 'electron';
import path from 'path';
import url from 'url';
import { promises as fs } from 'fs';
import mime from 'mime-types';
import windowStateKeeper from 'electron-window-state';

import {
  RenderOptions,
  getDistDirectory,
  renderAltair,
  renderInitSnippet,
} from 'altair-static';
import type { IdentityProvider } from 'altair-graphql-core/build/cjs/identity/providers';

import { checkMultipleDataVersions } from '../utils/check-multi-data-versions';
import { createSha256CspHash } from '../utils/csp-hash';
import { initMainProcessStoreEvents } from '../electron-store-adapter/main-store-events';
import {
  initSettingsStoreEvents,
  initUpdateAvailableEvent,
} from '../settings/main/events';

import { MenuManager } from './menu';
import { ActionManager } from './actions';
import { TouchbarManager } from './touchbar';
import { handleWithCustomErrors } from '../utils/index';
import { AuthServer } from '../auth/server/index';
import { getAutobackup, setAutobackup } from '../utils/backup';
import {
  IPC_EVENT_NAMES,
  ELECTRON_ALLOWED_FORBIDDEN_HEADERS,
  ALTAIR_CUSTOM_PROTOCOL,
  SETTINGS_STORE_EVENTS,
  InteropAppState,
  ALTAIR_WINDOW_ID_HEADER,
} from '@altairgraphql/electron-interop';
import { settingsSchema } from 'altair-graphql-core/build/types/state/settings.schema';
import { error, log } from '../utils/log';
import { ElectronApp } from './index';
import {
  getAltairSettingsFromFile,
  getPersisedSettingsFromFile,
  updateAltairSettingsOnFile,
} from '../settings/main/store';
import { cspAsString } from '../utils/csp';
import { SENTRY_CSP_REPORT_URI } from '../constants';
import { InteropStateManager } from '../interop-state-manager';

export class WindowManager {
  private instance?: BrowserWindow;

  mainWindowState?: windowStateKeeper.State;

  actionManager?: ActionManager;

  menuManager?: MenuManager;

  touchbarManager?: TouchbarManager;

  interopStateManager?: InteropStateManager;

  private ipcEventsInitialized = false;
  private sessionEventsInitialized = false;

  private rendererReady = new Promise((resolve) => {
    ipcMain.once(IPC_EVENT_NAMES.RENDERER_READY, () => {
      resolve(true);
    });
  });

  constructor(private electronApp: ElectronApp) {}

  getInstance() {
    return this.instance;
  }

  async createWindow() {
    await app.whenReady();
    this.registerProtocol();

    // Load the previous state with fallback to defaults
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 800,
    });

    // Create the browser window.
    this.instance = new BrowserWindow({
      show: false, // show when ready
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
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
        contextIsolation: true,
        // enableRemoteModule: process.env.NODE_ENV === "test", // remote required for spectron tests to work
        preload: require.resolve('@altairgraphql/electron-interop/build/preload.js'), // path.join(__dirname, '../preload', 'index.js'),
        sandbox: false,
      },
      // titleBarStyle: 'hidden-inset'
    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    this.mainWindowState.manage(this.instance);

    this.interopStateManager = new InteropStateManager();

    // Populate the application menu
    this.actionManager = new ActionManager(this);
    this.menuManager = new MenuManager(this.actionManager);
    // Set the touchbar
    this.touchbarManager = new TouchbarManager(
      this.actionManager,
      this.interopStateManager
    );
    this.instance.setTouchBar(this.touchbarManager.createTouchBar());

    // and load the index.html of the app.
    this.instance.loadURL(
      url.format({
        pathname: '-',
        protocol: `${ALTAIR_CUSTOM_PROTOCOL}:`,
        slashes: true,
      })
    );

    this.manageEvents();
  }

  sendMessage(channel: string, ...args: unknown[]) {
    // Listen for the renderer ready event,
    // then perform any pending actions
    this.rendererReady.then(() => {
      const instance = this.getInstance();

      if (instance) {
        instance.webContents.send(channel, ...args);
      }
    });
  }

  private manageEvents() {
    initMainProcessStoreEvents();
    initSettingsStoreEvents();
    this.initInstanceEvents();
    this.initSessionEvents();
    this.initIpcEvents();
  }

  private initIpcEvents() {
    // ipcMain events should only be initialized once
    if (this.ipcEventsInitialized) {
      return;
    }
    this.ipcEventsInitialized = true;

    ipcMain.on(IPC_EVENT_NAMES.RENDERER_RESTART_APP, () => {
      app.relaunch();
      app.exit();
    });

    ipcMain.handle('reload-window', (e) => {
      e.sender.reload();
    });

    ipcMain.on(IPC_EVENT_NAMES.RENDERER_SAVE_AUTOBACKUP_DATA, (e, data: string) => {
      setAutobackup(data);
    });

    ipcMain.on(
      IPC_EVENT_NAMES.RENDERER_SET_INTEROP_APP_STATE,
      (e, interopAppState: InteropAppState) => {
        this.interopStateManager?.setState(interopAppState);
      }
    );

    handleWithCustomErrors(
      IPC_EVENT_NAMES.RENDERER_GET_AUTH_TOKEN,
      async (e, provider: IdentityProvider) => {
        if (!e.sender || e.sender !== this.instance?.webContents) {
          throw new Error('untrusted source trying to get auth token');
        }

        const authServer = new AuthServer();
        return authServer.getCustomToken(provider);
      }
    );

    handleWithCustomErrors(
      IPC_EVENT_NAMES.RENDERER_GET_AUTOBACKUP_DATA,
      async (e) => {
        if (!e.sender || e.sender !== this.instance?.webContents) {
          throw new Error('untrusted source');
        }

        return getAutobackup();
      }
    );

    handleWithCustomErrors(
      SETTINGS_STORE_EVENTS.GET_ALTAIR_APP_SETTINGS,
      async (e) => {
        if (!e.sender || e.sender !== this.instance?.webContents) {
          throw new Error('untrusted source');
        }

        return getAltairSettingsFromFile();
      }
    );

    handleWithCustomErrors(
      SETTINGS_STORE_EVENTS.SET_ALTAIR_APP_SETTINGS,
      async (e, data) => {
        if (!e.sender || e.sender !== this.instance?.webContents) {
          throw new Error('untrusted source');
        }

        // Validate data is a SettingsState
        if (settingsSchema.safeParse(data).success) {
          return updateAltairSettingsOnFile(data);
        }
        error('Invalid settings data, not saving to file', data);
      }
    );
  }

  private initSessionEvents() {
    // session events should only be initialized once
    if (this.sessionEventsInitialized) {
      return;
    }
    this.sessionEventsInitialized = true;

    if (process.env.NODE_ENV /* === 'test'*/) {
      session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        log('Before request:', details);
        if (details.uploadData) {
          details.uploadData.forEach((uploadData) => {
            log('Data sent:', uploadData.bytes.toString());
          });
        }
        callback({
          cancel: false,
        });
      });
    }
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      // Set defaults
      details.requestHeaders.Origin = 'electron://altair';

      // log(this.requestHeaders);
      log('sending headers', details.requestHeaders);
      // Set the request headers
      const windowId =
        details.requestHeaders[ALTAIR_WINDOW_ID_HEADER] ??
        this.interopStateManager?.getState().activeWindowId;
      const headers = windowId
        ? this.interopStateManager?.getWindowState(windowId)?.headers ?? []
        : [];
      // Remove the altair window id header before sending the request
      delete details.requestHeaders[ALTAIR_WINDOW_ID_HEADER];
      headers.forEach((header) => {
        if (
          ELECTRON_ALLOWED_FORBIDDEN_HEADERS.includes(header.key.toLowerCase()) &&
          header.enabled &&
          header.key &&
          header.value
        ) {
          details.requestHeaders[header.key] = header.value;
        }
      });
      log('Final request headers', details.requestHeaders);
      callback({
        cancel: false,
        requestHeaders: details.requestHeaders,
      });
    });

    if (process.env.NODE_ENV /* === 'test'*/) {
      session.defaultSession.webRequest.onSendHeaders((details) => {
        if (details.requestHeaders) {
          Object.keys(details.requestHeaders).forEach((headerKey) => {
            log('Header sent:', headerKey, details.requestHeaders[headerKey]);
          });
        }
      });
    }

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      try {
        const u = new url.URL(details.url);
        // we only want to set the CSP for the altair custom protocol
        if (u.protocol !== ALTAIR_CUSTOM_PROTOCOL + ':') {
          return callback({ responseHeaders: details.responseHeaders });
        }

        // Allow iframe-sandbox to load without CSP
        if (u.pathname.includes('/iframe-sandbox')) {
          return callback({ responseHeaders: details.responseHeaders });
        }
      } catch {
        // Do nothing
      }

      if (['mainFrame', 'subFrame'].includes(details.resourceType)) {
        // Set the CSP
        const initialSnippet = renderInitSnippet(this.getRenderOptions());
        const scriptSrc = [
          `'self'`,
          `'sha256-1Sj1x3xsk3UVwnakQHbO0yQ3Xm904avQIfGThrdrjcc='`,
          `'${createSha256CspHash(initialSnippet)}'`,
          `https://cdn.jsdelivr.net`,
          `localhost:*`,
          `file:`,
        ];

        const additionalHeaders = {
          // TODO: Figure out why an error from this breaks devtools
          'Content-Security-Policy': [
            cspAsString({
              'script-src': scriptSrc,
              'object-src': ["'self'"],
              'report-uri': [SENTRY_CSP_REPORT_URI],
              'report-to': ['csp-endpoint'],
            }),
          ],
          'Report-To': JSON.stringify({
            group: 'csp-endpoint',
            max_age: 10886400, // 3 months
            endpoints: [
              {
                url: SENTRY_CSP_REPORT_URI,
              },
            ],
            include_subdomains: true,
          }),
          'Reporting-Endpoints': `csp-endpoint="${SENTRY_CSP_REPORT_URI}"`,
        };

        return callback({
          responseHeaders: {
            ...details.responseHeaders,
            ...additionalHeaders, // Additional headers
          },
        });
      }

      callback({ responseHeaders: details.responseHeaders });
    });
  }

  private initInstanceEvents() {
    if (!this.instance) {
      throw new Error(
        'Instance must be initialized before attempting to manage events'
      );
    }

    initUpdateAvailableEvent(this.instance.webContents);
    // Prevent the app from navigating away from the app
    this.instance.webContents.on('will-navigate', (e) => e.preventDefault());

    // Emitted when the window is closed.
    this.instance.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.instance = undefined;
    });

    this.instance.on('ready-to-show', () => {
      if (!this.instance) {
        throw new Error('instance not created!');
      }
      this.instance.show();
      this.instance.focus();
      checkMultipleDataVersions(this.instance);
    });

    this.instance.webContents.on('render-process-gone', (e, details) => {
      error('render process gone', details);
    });
  }

  private registerProtocol() {
    if (protocol.isProtocolHandled(ALTAIR_CUSTOM_PROTOCOL)) {
      return;
    }
    /**
     * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
     */
    protocol.handle(ALTAIR_CUSTOM_PROTOCOL, async (request) => {
      const requestDirectory = getDistDirectory();
      const originalFilePath = path.join(
        requestDirectory,
        new url.URL(request.url).pathname
      );
      const indexPath = path.join(requestDirectory, 'index.html');
      log('index path', indexPath);

      const { mimeType, data } = await this.getFileContentData(
        originalFilePath,
        indexPath
      );
      return new Response(
        new Blob([new Uint8Array(data)]), // Convert Buffer to Uint8Array for Blob
        { headers: { 'content-type': mimeType } }
      );
    });
  }

  private async getFilePath(filePath: string): Promise<string> {
    log('file..', filePath);

    if (!filePath) {
      return '';
    }

    if (filePath.endsWith('.map')) {
      return filePath;
    }
    const stats = await fs.stat(filePath);
    if (stats.isFile()) {
      return filePath;
    }

    if (stats.isDirectory()) {
      return this.getFilePath(path.join(filePath, 'index.html'));
    }

    return '';
  }

  /**
   * @param {string} originalFilePath path to file
   * @param {string} fallbackPath usually path to index file
   */
  private async getFileContentData(originalFilePath: string, fallbackPath: string) {
    let filePath = await this.getFilePath(originalFilePath);

    if (!filePath) {
      filePath = fallbackPath;
    }
    if (filePath?.endsWith('.map')) {
      return {
        mimeType: 'text/plain',
        data: Buffer.from(
          '{"version": 3, "file": "index.module.js", "sources": [], "sourcesContent": [], "names": [], "mappings":""}'
        ),
      };
    }

    // some files are binary files, eg. font, so don't encode utf8
    let data = await fs.readFile(filePath);

    if (filePath === fallbackPath) {
      data = Buffer.from(renderAltair(this.getRenderOptions()), 'utf-8');
    }

    // Load the data from the file into a buffer and pass it to the callback
    // Using the mime package to get the mime type for the file, based on the file name
    return {
      mimeType: mime.lookup(filePath) || '',
      data,
    };
  }

  private getRenderOptions(): RenderOptions {
    return {
      persistedSettings: getPersisedSettingsFromFile(),
    };
  }
}
