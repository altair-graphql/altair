'use strict';

import * as express from 'express';
import {
  getDistDirectory,
  renderAltair,
  renderInitSnippet,
  RenderOptions,
  isSandboxFrame,
} from 'altair-static';

export type ExpressRenderOptions = RenderOptions & {
  /**
   * Generates a Content Security Policy (CSP) nonce for the request.
   * @param req The Express request object.
   * @param res The Express response object.
   * @returns The generated CSP nonce.
   */
  cspNonceGenerator?: (req: express.Request, res: express.Response) => string;
};
export const altairExpress = (opts: ExpressRenderOptions): express.Express => {
  const app = express();
  // Disable strict routing since we *need* to make sure the route does not end with a trailing slash
  app.disable('strict routing');

  app.get('/', (req, res) => {
    // Redirect all trailing slash
    const path = req.originalUrl.replace(/\?.*/, '');
    if (!path.endsWith('/')) {
      const query = req.originalUrl.slice(path.length);
      return res.redirect(301, path + '/' + query);
    }
    return res.send(renderAltair(getRequestRenderOptions(req, res, opts)));
  });
  app.get('/initial_options.js', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    return res.send(renderInitSnippet(getRequestRenderOptions(req, res, opts)));
  });
  app.use(
    express.static(getDistDirectory(), {
      setHeaders: (res, path) => {
        if (isSandboxFrame(path)) {
          // Disable CSP for the sandbox iframe
          res.setHeader('Content-Security-Policy', '');
        }
      },
    })
  );

  /**
   * Catch-all route
   */
  app.get('*', (req, res) => {
    return res.send('404.');
  });

  return app;
};

function getRequestRenderOptions(
  req: express.Request,
  res: express.Response,
  opts: ExpressRenderOptions
): RenderOptions {
  let cspNonce = opts.cspNonce;
  if (!cspNonce && opts.cspNonceGenerator) {
    cspNonce = opts.cspNonceGenerator(req, res);
  }
  return {
    ...opts,
    cspNonce,
  };
}
