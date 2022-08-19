import { Server } from "http";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { EventEmitter } from "events";
import path from "path";
import {} from "crypto";
import { getStaticDirectory } from "../../utils";
import { BrowserWindow, ipcMain, session, shell } from "electron";
import { getCSP, INLINE, SELF } from "csp-header";
import { v4 as uuid } from "uuid";

export const IPC_SET_CUSTOM_TOKEN_EVENT = "auth:set-custom-token";

export class AuthServer {
  private app = express();
  private port = 3000; // default port. Might be different at runtime.
  private server?: Server;
  private sessionPartition = "persist:auth";
  private nonce = uuid();
  private emitter = new EventEmitter();
  private ttlSeconds = 10 * 60; // 10m

  constructor() {
    this.app.use(
      express.static(path.resolve(getStaticDirectory(), "auth/dist"))
    );
    this.app.use(bodyParser.json());

    this.app.use("/login", (req, res) => {
      return res.sendFile(
        path.resolve(getStaticDirectory(), "auth/dist/index.html")
      );
    });
    this.app.use("/callback", (req, res) => {
      // TODO: Verify ttl
      if (req.body.nonce !== this.nonce) {
        return res
          .status(400)
          .send({ status: "error", message: "invalid request" });
      }

      this.emitter.emit("token", req.body.token);
      return res.send({ status: "success" });
    });
  }
  async start() {
    this.port = await this.getAvailablePort();
    this.server = this.app.listen(this.port, () => {
      console.log(`auth server listening at port ${this.port}`);
    });
  }

  terminate() {
    // TODO: Verify properly terminating server

    if (this.server) {
      this.server.close();
    }
  }

  async getCustomToken() {
    if (!this.server) {
      await this.start();
    }
    // open auth window
    // wait for user to complete auth dance
    // listen for auth window to send custom token
    // close auth window
    // return custom token
    // let authWindow: BrowserWindow | undefined = new BrowserWindow({
    //   width: 800,
    //   height: 600,
    //   webPreferences: {
    //     session: this.getSession(),
    //     preload: path.join(__dirname, "preload.js"),
    //   },
    // });

    // authWindow.loadURL(`http://localhost:${this.port}/start`);
    // authWindow.on("closed", () => {
    //   authWindow = undefined;
    // });
    await shell.openExternal(
      `http://localhost:${this.port}/login?nonce=${this.nonce}`
    );

    // normally should be before the line to load the URL, but considering
    // we don't expect this event to fire immediately the page is
    // loaded, should be fine to move it down here
    const token = await this.listenForToken();

    // ipcMain.off();
    // authWindow.close(); // ??
    this.terminate();

    return token;
  }

  private listenForToken() {
    return new Promise<string>((resolve, reject) => {
      this.emitter.once("token", (token: string) => {
        if (!token) {
          return reject("Could not get token");
        }
        return resolve(token);
      });
      // TODO: Cleanup
      // ipcMain.on(IPC_SET_CUSTOM_TOKEN_EVENT, (e, token) => {
      //   const webcontent = e.sender;
      //   const win = BrowserWindow.fromWebContents(webcontent);

      //   if (!win || win !== authWindow) {
      //     console.log("unexpected window sent event!");
      //     return reject(new Error("unexpected window sent event!"));
      //   }

      //   if (!token) {
      //     return reject("Could not get token");
      //   }

      //   return resolve(token);
      // });
    });
  }

  private getSession() {
    const authSession = session.fromPartition(this.sessionPartition);
    authSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            getCSP({
              directives: {
                // "default-src": ["none"],
                "script-src": [
                  SELF,
                  INLINE,
                  "strict-dynamic",
                  "https://www.gstatic.com",
                  "https://apis.google.com",
                ],
              },
            }),
          ],
        },
      });
    });

    return authSession;
  }

  private async getAvailablePort() {
    const getPort = await import("get-port");
    return getPort.default({ port: this.port });
  }
}
