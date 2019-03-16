---
title: Home
nav_order: 0
---

# Test your GraphQL queries easily

Altair makes it very easy and delightful to test your GraphQL queries and server implementations, providing you with all the features you would need.
{: .fs-6 .fw-300 }

<span class="fs-6">
[Download Now](https://altair.sirmuel.design/#download){: .btn .btn-green }
</span>

---

![Altair GraphQL](/assets/img/app-shot.png)

## Getting Started

There are several options to choose from for you to use Altair, depending on your environment:

1. Desktop apps for [Mac, Windows and Linux](https://altair.sirmuel.design/). You can get the latest version [here](https://altair.sirmuel.design/#download).
1. [Chrome extension](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja) for [Google Chrome](https://www.google.com/chrome/) users.

1. [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/) for [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/) users.


For MacOS users, you can also install Altair using [cask](https://github.com/Homebrew/homebrew-cask):

```
$ brew cask install altair-graphql-client
```

For linux users, you can also install Altair using [snap](https://snapcraft.io/altair):

```
$ snap install altair
```

For quick one-time usage or to see how it works, you can also use the [web app](https://altair-gql.sirmuel.design/): [https://altair-gql.sirmuel.design/](https://altair-gql.sirmuel.design/)

Note
{: .label .label-yellow }
It is **NOT** recommended to use the web app for full development, because there are some limitations there which might lead to frustrations if something isn't working as expected. It is preferred for you to use the desktop apps where possible, or the browser extensions for ease of use.


### Usage with express
You can use altair with an express server using [altair-express-middleware](https://www.npmjs.com/package/altair-express-middleware).

This is an express middleware for mounting an instance of altair GraphQL client.

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
