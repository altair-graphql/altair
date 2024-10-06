import { AltairFastify } from '../../packages/altair-fastify-plugin/dist';

// const Fastify = require("fastify");
import Fastify from 'fastify';
// const AltairFastify = require("altair-fastify-plugin");
// import AltairFastify from 'altair-fastify-plugin';

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
app.listen({ port: 3000 }, () => {
  console.log('Server listening at http://localhost:3000');
});
