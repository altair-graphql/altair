import { app, BrowserWindow, protocol, session, shell } from "electron";
import { readFile } from "fs";
import isDev from "electron-is-dev";
import { setupAutoUpdates } from "../updates";
import { InMemoryStore } from "../store";
import { WindowManager } from "./window";
import { store } from "../settings/main/store";
import { AuthServer } from "../auth/server";

export class ElectronApp {
  store: InMemoryStore;
  windowManager: WindowManager;

  constructor() {
    this.store = new InMemoryStore();
    this.windowManager = new WindowManager(this);

    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      console.log("An instance already exists.");
      app.quit();
      return process.exit(0);
    }

    protocol.registerSchemesAsPrivileged([
      {
        scheme: "altair",
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

  manageEvents() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", async () => {
      const settings = store.get("settings");
      console.log(settings);
      if (settings) {
        /**
         * @type Electron.Config
         */
        const proxyConfig: Electron.Config = {
          mode: "direct",
        };

        switch (settings.proxy_setting) {
          case "none":
            proxyConfig.mode = "direct";
            break;
          case "autodetect":
            proxyConfig.mode = "auto_detect";
            break;
          case "system":
            proxyConfig.mode = "system";
            break;
          case "pac":
            proxyConfig.mode = "pac_script";
            proxyConfig.pacScript = settings.pac_address;
            break;
          case "proxy_server":
            proxyConfig.mode = "fixed_servers";
            proxyConfig.proxyRules = `${settings.proxy_host}:${settings.proxy_port}`;
            break;
          default:
        }
        await session.defaultSession.setProxy(proxyConfig);
        const proxy = await session.defaultSession.resolveProxy(
          "http://localhost"
        );
        console.log(proxy, proxyConfig);
      }
      this.windowManager.createWindow();

      if (!isDev) {
        setupAutoUpdates();
      }
    });

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (!this.windowManager) {
        throw new Error("App not started");
      }
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (!this.windowManager.getInstance()) {
        this.windowManager.createWindow();
      }
    });

    app.on("will-finish-launching", () => {
      app.on("open-file", (ev, path) => {
        readFile(path, "utf8", (err, data) => {
          if (err) {
            return;
          }
          const instance = this.windowManager.getInstance();

          if (instance) {
            instance.webContents.send("file-opened", data);
          }

          this.store.set("file-opened", data);
        });
      });
    });

    app.on(
      "certificate-error",
      (event, webContents, url, error, certificate, callback) => {
        event.preventDefault();
        callback(true);
        // Inform user of invalid certificate
        webContents.send("certificate-error", error);
      }
    );

    app.on("web-contents-created", (event, contents) => {
      contents.on("new-window", (e, navigationUrl) => {
        // Ask the operating system to open this event's url in the default browser.
        e.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });
  }
}
