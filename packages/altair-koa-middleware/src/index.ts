'use strict';

import { ParameterizedContext } from 'koa';
import { send } from '@koa/send';
import * as KoaRouter from '@koa/router';
import {
  getDistDirectory,
  renderAltair,
  RenderOptions,
  isSandboxFrame,
} from 'altair-static';

export interface AltairKoaMiddlewareOptions {
  router: KoaRouter;
  url: string;
  opts: RenderOptions;
  /**
   * Generates a Content Security Policy (CSP) nonce for the request.
   * @param ctx The Koa context.
   * @returns The generated CSP nonce.
   */
  cspNonceGenerator?: (ctx: ParameterizedContext) => string;
}
export const createRouteExplorer = ({
  router,
  url,
  opts,
  cspNonceGenerator,
}: AltairKoaMiddlewareOptions) => {
  router.get(url, async (ctx, next) => {
    const cspNonce = opts.cspNonce ?? cspNonceGenerator?.(ctx);
    ctx.body = renderAltair({
      baseURL: ctx.url.replace(/\/?$/, '/'),
      ...opts,
      cspNonce,
    });

    await next();
  });

  // Use the main favicon for my API subdomain.
  router.get(`${url}/favicon.ico`, (ctx) => {
    ctx.status = 301;
    ctx.redirect(`/favicon.ico`);
  });

  router.get(`${url}/*path`, async (ctx) => {
    const path = ctx.params.path;
    // Disable CSP for the sandbox iframe
    if (path && isSandboxFrame(path)) {
      ctx.set('Content-Security-Policy', '');
    }
    await send(ctx, path || '', { root: getDistDirectory() });
  });
};
