import { AltairFastify } from '../../packages/altair-fastify-plugin/dist';

// const Fastify = require("fastify");
import Fastify from 'fastify';
import { fastifyHelmet } from '@fastify/helmet';
import { randomBytes } from 'crypto';
// const AltairFastify = require("altair-fastify-plugin");
// import AltairFastify from 'altair-fastify-plugin';

const app = Fastify();

// Add a simple handler to all requests
app.addHook('onRequest', async (request, reply) => {
  (reply.raw as any).scriptNonce = randomBytes(16).toString('base64');
  // console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
});

// ...

// Generate a nonce for each request

app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      // ...fastifyHelmet.contentSecurityPolicy.getDefaultDirectives(),
      scriptSrc: [
        "'self'",
        "'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I='",
        // function (req, res) {
        //     // "res" here is actually "reply.raw" in fastify
        //     res.scriptNonce = randomBytes(16).toString('hex')
        //     // make sure to return nonce-... directive to helmet, so it can be sent in the headers
        //     return `'nonce-${res.scriptNonce}'`
        //   }
        (req: any, res: any) => `'nonce-${res.scriptNonce}'`,
      ],
      styleSrc: ["'self'", (req: any, res: any) => `'nonce-${res.scriptNonce}'`],
    },
  },
});

app.register(AltairFastify, {
  /**
   * All these are the defaults.
   */
  path: '/altair',
  baseURL: '/altair/',
  endpointURL: '/graphql',
  cspNonceGenerator: (req: any, res: any) => res.raw.scriptNonce,
});

// ...

// Altair available at localhost:3000/altair
app.listen({ port: 3000 }, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening at http://localhost:3000');
});
