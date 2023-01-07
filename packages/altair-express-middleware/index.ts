'use strict';

import * as express from 'express';
import {
  getDistDirectory,
  renderAltair,
  renderInitialOptions,
  RenderOptions,
} from 'altair-static';

export const altairExpress = (opts: RenderOptions): express.Express => {
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
