import { BrowserWindow, protocol, ipcMain, session, app } from "electron";
import path from "path";
import url from "url";
import { promises as fs } from "fs";
import mime from "mime-types";
import windowStateKeeper from "electron-window-state";

import {
  getDistDirectory,
  renderAltair,
  renderInitialOptions
} from "altair-static";

import { checkMultipleDataVersions } from "../utils/check-multi-data-versions";
import { createSha256CspHash } from "../utils/csp-hash";
import { initMainProcessStoreEvents } from "../electron-store-adapter/main-store-events";
import {
  initSettingsStoreEvents,
  initUpdateAvailableEvent
} from "../settings/main/events";

import { ElectronApp } from "./index";
import { MenuManager } from "./menu";
import { ActionManager } from "./actions";
import { TouchbarManager } from "./touchbar";
import { handleWithCustomErrors } from "../utils/index";
import { AuthServer } from "../auth/server/index";

const HEADERS_TO_SET = ["Origin", "Cookie"];

export class WindowManager {
  instance?: BrowserWindow;
  mainWindowState?: windowStateKeeper.State;
  requestHeaders: Record<string, string> = {};

  actionManager?: ActionManager;
  menuManager?: MenuManager;
  touchbarManager?: TouchbarManager;

  constructor(private electronApp: ElectronApp) {}

  getInstance() {
    return this.instance;
  }

  createWindow() {
    this.registerProtocol();

    // Load the previous state with fallback to defaults
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 800
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
        // TODO: Enable context isolation https://www.electronjs.org/docs/latest/tutorial/context-isolation
        // TODO: Migrate current preload/IPC usage to use contextBridge instead
        contextIsolation: false,
        // enableRemoteModule: process.env.NODE_ENV === "test", // remote required for spectron tests to work
        preload: path.join(__dirname, "../preload", "index.js")
      }
      // titleBarStyle: 'hidden-inset'
    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    this.mainWindowState.manage(this.instance);

    // Populate the application menu
    this.actionManager = new ActionManager(this.instance);
    this.menuManager = new MenuManager(this.actionManager);
    // Set the touchbar
    this.touchbarManager = new TouchbarManager(this.actionManager);
    this.instance.setTouchBar(this.touchbarManager.createTouchBar());

    // and load the index.html of the app.
    this.instance.loadURL(
      url.format({
        pathname: "-",
        protocol: "altair:",
        slashes: true
      })
    );
    // instance.loadURL('http://localhost:4200/');

    this.manageEvents();
  }

  manageEvents() {
    if (!this.instance) {
      throw new Error(
        "Instance must be initialized before attempting to manage events"
      );
    }

    initMainProcessStoreEvents();
    initSettingsStoreEvents();
    initUpdateAvailableEvent(this.instance.webContents);
    // Prevent the app from navigating away from the app
    this.instance.webContents.on("will-navigate", e => e.preventDefault());

    // instance.webContents.once('dom-ready', () => {
    //   instance.webContents.openDevTools();
    // });

    // Emitted when the window is closed.
    this.instance.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.instance = undefined;
    });

    this.instance.on("ready-to-show", () => {
      if (!this.instance) {
        throw new Error("instance not created!");
      }
      this.instance.show();
      this.instance.focus();
      checkMultipleDataVersions(this.instance);
    });

    if (process.env.NODE_ENV /* === 'test'*/) {
      session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        console.log("Before request:", details);
        if (details.uploadData) {
          details.uploadData.forEach(uploadData => {
            console.log("Data sent:", uploadData.bytes.toString());
          });
        }
        callback({
          cancel: false
        });
      });
    }
    session.defaultSession.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        // Set defaults
        details.requestHeaders.Origin = "electron://altair";

        // console.log(this.requestHeaders);
        // console.log('sending headers', details.requestHeaders);
        // Set the request headers
        Object.keys(this.requestHeaders).forEach(key => {
          details.requestHeaders[key] = this.requestHeaders[key];
        });
        callback({
          cancel: false,
          requestHeaders: details.requestHeaders
        });
      }
    );

    if (process.env.NODE_ENV /* === 'test'*/) {
      session.defaultSession.webRequest.onSendHeaders(details => {
        if (details.requestHeaders) {
          Object.keys(details.requestHeaders).forEach(headerKey => {
            console.log(
              "Header sent:",
              headerKey,
              details.requestHeaders[headerKey]
            );
          });
        }
      });
    }

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      // console.log('received headers..', details.responseHeaders);
      const scriptSrc = [
        `'self'`,
        `'sha256-1Sj1x3xsk3UVwnakQHbO0yQ3Xm904avQIfGThrdrjcc='`,
        `'${createSha256CspHash(renderInitialOptions())}'`,
        `https://cdn.jsdelivr.net`,
        `https://apis.google.com`,
        `localhost:*`,
        `file:`
      ];
      callback({
        responseHeaders: Object.assign({}, details.responseHeaders, {
          // Setting CSP
          // TODO: Figure out why an error from this breaks devtools
          "Content-Security-Policy": [
            `script-src ${scriptSrc.join(" ")}; object-src 'self';`
            // `script-src 'self' 'sha256-1Sj1x3xsk3UVwnakQHbO0yQ3Xm904avQIfGThrdrjcc=' '${createSha256CspHash(renderInitialOptions())}' https://cdn.jsdelivr.net localhost:*; object-src 'self';`
          ]
        })
      });
    });

    ipcMain.on("restart-app", () => {
      app.relaunch();
      app.exit();
    });

    // TODO: Get type from altair-app as a devDependency
    // Get 'set headers' instruction from app
    ipcMain.on(
      "set-headers-sync",
      (e, headers: { key: string; value: string; enabled?: boolean }[]) => {
        this.requestHeaders = {};

        headers.forEach(header => {
          if (
            HEADERS_TO_SET.includes(header.key) &&
            header.key &&
            header.value &&
            header.enabled
          ) {
            this.requestHeaders[header.key] = header.value;
          }
        });

        e.returnValue = true;
      }
    );

    // Listen for the `get-file-opened` instruction,
    // then retrieve the opened file from the store and send it to the instance.
    // Then remove it from the store
    ipcMain.on("get-file-opened", () => {
      if (!this.instance) {
        throw new Error("instance not created!");
      }
      let openedFileContent = this.electronApp.store.get("file-opened");
      if (!openedFileContent) {
        return;
      }

      this.instance.webContents.send("file-opened", openedFileContent);
      this.electronApp.store.delete("file-opened");
    });

    ipcMain.handle("reload-window", e => {
      e.sender.reload();
    });

    // TODO: Create an electron-interop package and move this there
    handleWithCustomErrors("get-auth-token", async e => {
      if (!e.sender || e.sender !== this.instance?.webContents) {
        throw new Error("untrusted source trying to get auth token");
      }

      const authServer = new AuthServer();
      return authServer.getCustomToken();
    });
  }

  registerProtocol() {
    /**
     * Using a custom buffer protocol, instead of a file protocol because of restrictions with the file protocol.
     */
    protocol.registerBufferProtocol("altair", (request, callback) => {
      const requestDirectory = getDistDirectory();
      const originalFilePath = path.join(
        requestDirectory,
        new url.URL(request.url).pathname
      );
      const indexPath = path.join(requestDirectory, "index.html");

      this.getFileContentData(originalFilePath, indexPath)
        .then(({ mimeType, data }) => {
          callback({ mimeType, data });
        })
        .catch(error => {
          error.message = `Failed to register protocol. ${error.message}`;
          console.error(error);
        });
    });
  }

  async getFilePath(filePath: string): Promise<string> {
    console.log("file..", filePath);

    if (!filePath) {
      return "";
    }

    if (filePath.endsWith(".map")) {
      return filePath;
    }
    const stats = await fs.stat(filePath);
    if (stats.isFile()) {
      return filePath;
    }

    if (stats.isDirectory()) {
      return this.getFilePath(path.join(filePath, "index.html"));
    }

    return "";
  }

  /**
   * @param {string} originalFilePath path to file
   * @param {string} fallbackPath usually path to index file
   */
  async getFileContentData(originalFilePath: string, fallbackPath: string) {
    let filePath = await this.getFilePath(originalFilePath);

    if (!filePath) {
      filePath = fallbackPath;
    }
    if (filePath && filePath.endsWith(".map")) {
      return {
        mimeType: "text/plain",
        data: Buffer.from(
          '{"version": 3, "file": "index.module.js", "sources": [], "sourcesContent": [], "names": [], "mappings":""}'
        )
      };
    }

    // some files are binary files, eg. font, so don't encode utf8
    let data = await fs.readFile(filePath);

    if (filePath && filePath.includes("index.html")) {
      data = Buffer.from(renderAltair(), "utf-8");
    }

    // Load the data from the file into a buffer and pass it to the callback
    // Using the mime package to get the mime type for the file, based on the file name
    return {
      mimeType: mime.lookup(filePath) || "",
      data: data
    };
  }
}
