# altair-express-middleware

[![npm](https://img.shields.io/npm/v/altair-express-middleware.svg)](https://www.npmjs.com/package/altair-express-middleware)

This is an express middleware for mounting an instance of altair GraphQL client.

### Installation
This is a node module and can be installed using npm:

```
npm install --save altair-express-middleware
```

Alternatively, if you are using [`yarn`](https://yarnpkg.com/):

```
yarn add altair-express-middleware
```

### Usage

```js
import express from 'express';
import { graphqlExpress } from 'graphql-server-express';
import { altairExpress } from 'altair-express-middleware';

import { schema } from './schema';

const server = express();

// Mount your graphQL server endpoint
server.use('/graphql', bodyParser.json(), graphqlExpress({
  schema
}));

// Mount your altair GraphQL client
server.use('/altair', altairExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
  initialQuery: `{ getData { id name surname } }`,
}));

// ... the rest of your code ...
```

An instance of Altair GraphQL Client would be available at `/altair` of your server.

### Contributing
Everyone is welcome to contribute. See anything that needs improving, create an issue. And if you're up for it, create a PR! :D

### License

[MIT](../../LICENSE)
