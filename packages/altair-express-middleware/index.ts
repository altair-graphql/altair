'use strict';

import * as express from 'express';
import { getDistDirectory, renderAltair, renderInitialOptions, RenderOptions } from 'altair-static';

export const altairExpress = (opts: RenderOptions): express.Express => {
  const app = express();
  // Disable strict routing since we *need* to make sure the route does not end with a trailing slash
  app.disable('strict routing');

  // Redirect all trailing slash
  // https://stackoverflow.com/a/15773824/3929126
  app.use((req, res, next) => {
    if (req.path.substr(-1) === '/' && req.path.length > 1) {
      const query = req.url.slice(req.path.length)
      const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
      res.redirect(301, safepath + query)
    } else {
      next()
    }
  });

  app.get('/', (req, res) => {
    return res.send(renderAltair(opts));
  });
  app.get('/initial_options.js', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    return res.send(renderInitialOptions(opts));
  });
  app.use(express.static(getDistDirectory()));

  /**
   * Catch-all route
   */
  app.get('*', (req, res) => {
    return res.send('404.');
  });

  return app;
};
