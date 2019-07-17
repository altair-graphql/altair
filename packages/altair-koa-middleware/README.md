# altair-koa-middleware

[![npm](https://img.shields.io/npm/v/altair-koa-middleware.svg)](https://www.npmjs.com/package/altair-koa-middleware)

This is a koa middleware for mounting an instance of altair GraphQL client.

### Installation
This is a node module and can be installed using npm:

```
npm install --save altair-koa-middleware
```

Alternatively, if you are using [`yarn`](https://yarnpkg.com/):

```
yarn add altair-koa-middleware
```

### Usage

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
    endpoint: '/graphql',
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

### Contributing
Everyone is welcome to contribute. See anything that needs improving, create an issue. And if you're up for it, create a PR! :D

### License

[MIT](../../LICENSE)
