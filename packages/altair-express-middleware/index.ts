'use strict';

import * as express from 'express';
import { getDistDirectory, renderAltair, RenderOptions } from 'altair-static';

export const altairExpress = (opts: RenderOptions): express.Express => {
  const app = express();
  app.disable('strict routing');

  app.get('/', (req, res) => {
    if (req.originalUrl.substr(-1) !== '/') {
      // We need the trailing slash to enable relative file paths to work
      return res.redirect(301, req.originalUrl + '/');
    }
    return res.send(renderAltair(opts));
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
