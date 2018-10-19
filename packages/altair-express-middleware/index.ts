'use strict';

import * as express from 'express';
import { getDistDirectory, renderAltair, RenderOptions } from 'altair-static';

export const altairExpress = (opts: RenderOptions): express.Express => {
  const app = express();

  app.get('/', (req, res) => {
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
