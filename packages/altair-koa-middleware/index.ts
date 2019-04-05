'use strict';

import * as send from 'koa-send';
import { getDistDirectory, renderAltair, RenderOptions } from 'altair-static';

export const createRouteExplorer = ({ router, url, opts }: { router, url: string, opts: RenderOptions }) => {
  router.get(url, async (ctx, next) => {

    ctx.body = renderAltair({ baseURL: ctx.url.replace(/\/?$/, '/'), ...opts });

    await next();
  })

  // Use the main favicon for my API subdomain.
  router.get(`${url}/favicon.ico`, ctx => {
    ctx.status = 301;
    ctx.redirect(`/favicon.ico`);
  })

  router.get(`${url}/:path+`, async ctx => {
    await send(ctx, ctx.params.path, { root: getDistDirectory() });
  })
};
