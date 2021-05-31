---
parent: Integrations
---

# altair-express-middleware

<Badge text="npm" type="error"/>
<Badge text="express"/>

You can use Altair with an Express server using [altair-express-middleware](https://www.npmjs.com/package/altair-express-middleware).

This is an Express middleware for mounting an instance of Altair GraphQL client.

#### Installation

This is a node module and can be installed using npm:

```
npm install --save altair-express-middleware
```

Alternatively, if you are using [`yarn`](https://yarnpkg.com/):

```
yarn add altair-express-middleware
```

#### Usage

```js
import express from 'express';
import { graphqlExpress } from 'graphql-server-express';
import { altairExpress } from 'altair-express-middleware';

import { schema } from './schema';

const server = express();

// Mount your GraphQL server endpoint
server.use('/graphql', bodyParser.json(), graphqlExpress({
  schema
}));

// Mount your Altair GraphQL client
server.use('/altair', altairExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
  initialQuery: `{ getData { id name surname } }`,
}));

// ... the rest of your code ...
```

An instance of Altair GraphQL Client would be available at `/altair` of your server.
