# altair-fastify-plugin

[![npm](https://img.shields.io/npm/v/altair-fastify-plugin.svg)](https://www.npmjs.com/package/altair-fastify-plugin)

This is a [**Fastify Plugin**](https://www.fastify.io/docs/master/Plugins/) for hosting an instance of **Altair GraphQL Client**, with support for **TypeScript**, and tested for **Fastify v3**.

## Install

```sh
npm install altair-fastify-plugin
# or
yarn add altair-fastify-plugin
```

## Usage

```js
// const Fastify = require("fastify");
import Fastify from 'fastify';
// const AltairFastify = require("altair-fastify-plugin");
import AltairFastify from 'altair-fastify-plugin';

const app = Fastify();

// ...

app.register(AltairFastify, {
  /**
   * All these are the defaults.
   */
  path: '/altair',
  baseURL: '/altair/',
  endpointURL: '/graphql',
});

// ...

// Altair available at localhost:3000/altair
app.listen(3000);
```
