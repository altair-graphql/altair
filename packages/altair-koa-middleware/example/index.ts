import * as Koa from 'koa';
import * as KoaRouter from '@koa/router';
import { createRouteExplorer } from '../src/index';

const app = new Koa();
const router = new KoaRouter();
const port = 3130;

// app.use(async ctx => {
//   ctx.body = 'Hello world';
// });
createRouteExplorer({
  url: '/altair',
  router,
  opts: {
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{ getData { id name surname } }`,
    initialPreRequestScript: `console.log('Hello from pre request!')`,
  },
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on port ${port}`));
