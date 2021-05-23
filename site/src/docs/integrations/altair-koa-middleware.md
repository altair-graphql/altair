---
parent: Integrations
---

# altair-koa-middleware

<Badge text="npm" type="error"/>
<Badge text="koa"/>

You can use Altair with a Koa server using [altair-koa-middleware](https://www.npmjs.com/package/altair-koa-middleware).

This is an koa middleware for mounting an instance of Altair GraphQL client.

#### Installation

This is a node module and can be installed using npm:

```
npm install --save altair-koa-middleware
```

Alternatively, if you are using [`yarn`](https://yarnpkg.com/):

```
yarn add altair-koa-middleware
```

#### Usage

```js
import Koa from 'koa';
import KoaRouter from 'koa-router';
import { createRouteExplorer } from 'altair-koa-middleware';
const app = new Koa();
const router = new KoaRouter();

createRouteExplorer({
  url: '/altair',
  router,
  opts: {
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{ getData { id name surname } }`,
  },
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3500);

// ... the rest of your code ...
```

An instance of Altair GraphQL Client would be available at `/altair` of your server.
