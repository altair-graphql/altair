import { Server } from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { EventEmitter } from 'events';
import path from 'path';
import { randomBytes } from 'crypto';
import { session, shell } from 'electron';
import { getCSP, INLINE, SELF } from 'csp-header';
import getPort from 'get-port';
import { getPopupUrl } from 'altair-graphql-core/build/identity/providers';
import type { IdentityProvider } from 'altair-graphql-core/build/identity/providers';

export const IPC_SET_CUSTOM_TOKEN_EVENT = 'auth:set-custom-token';

const newNonce = () => {
  const validChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = randomBytes(40).map((x) =>
    validChars.charCodeAt(x % validChars.length)
  );
  return String.fromCharCode(...array);
};
const authClientStaticDirectory = () =>
  path.resolve(require.resolve('@altairgraphql/login-redirect'), '..', 'dist');

export class AuthServer {
  private port = 3000; // default port. Might be different at runtime.
  private server?: Server;
  private sessionPartition = 'persist:auth';
  private nonce = newNonce();
  private emitter = new EventEmitter();
  private ttlSeconds = 10 * 60; // 10m

  async start() {
    const app = express();
    app.use(express.static(authClientStaticDirectory()));
    app.use(bodyParser.json());

    app.use('/login', (req, res) => {
      return res.sendFile(path.resolve(authClientStaticDirectory(), 'index.html'));
    });
    app.use('/callback', (req, res) => {
      // TODO: Verify ttl
      if (req.body.nonce !== this.nonce) {
        return res.status(400).send({ status: 'error', message: 'invalid request' });
      }

      this.emitter.emit('token', req.body.token);
      return res.send({ status: 'success' });
    });

    this.port = await this.getAvailablePort();
    this.server = app.listen(this.port, () => {
      // console.log(`auth server listening at port ${this.port}`);
    });
  }

  terminate() {
    this.emitter.removeAllListeners('token');
    if (this.server) {
      this.server.close();
    }
  }

  async getCustomToken(provider: IdentityProvider) {
    if (!this.server) {
      await this.start();
    }
    // TODO: Use a hosted domain instead
    await shell.openExternal(
      getPopupUrl(`http://localhost:${this.port}/login`, this.nonce, '', provider)
    );

    const token = await this.listenForToken();

    this.terminate();

    return token;
  }

  private listenForToken() {
    return new Promise<string>((resolve, reject) => {
      this.emitter.once('token', (token: string) => {
        if (!token) {
          return reject(new Error('Could not get token'));
        }
        return resolve(token);
      });
    });
  }

  private getSession() {
    const authSession = session.fromPartition(this.sessionPartition);
    authSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            getCSP({
              directives: {
                // "default-src": ["none"],
                'script-src': [
                  SELF,
                  INLINE,
                  'strict-dynamic',
                  'https://www.gstatic.com',
                  'https://apis.google.com',
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
    return getPort({ port: this.port });
  }
}
