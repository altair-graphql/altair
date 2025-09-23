import * as Koa from 'koa';
import helmet from 'koa-helmet';
import { randomBytes } from 'crypto';
import * as KoaRouter from '@koa/router';
import { createRouteExplorer } from '../../packages/altair-koa-middleware/src';

const app = new Koa();
const port = 3005;
const router = new KoaRouter();

app.use(async (ctx, next) => {
  ctx.state.cspNonce = randomBytes(16).toString('base64');
  await next();
});
app.use(async (ctx, next) => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        // ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        scriptSrc: [
          "'self'",
          "'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I='",
          `'nonce-${ctx.state.cspNonce}'`,
        ],
        styleSrc: ["'self'", `'nonce-${ctx.state.cspNonce}'`],
      },
    },
  })(ctx, next);
});

router.get('/', (ctx) => {
  ctx.body = 'Hello World';
});

createRouteExplorer({
  url: '/altair',
  router,
  opts: {
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{ getData { id name surname } }`,
    initialPreRequestScript: `console.log('Hello from pre request!')`,
  },
  cspNonceGenerator: (ctx) => ctx.state.cspNonce,
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on port ${port}`);
});
