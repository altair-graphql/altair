---
parent: Features
---

# Using Content Security Policy (CSP) with Altair

::: warning Beta
Enabling CSP in Altair is currently in beta. While we have tested it in various environments, there may still be edge cases or specific configurations that could cause issues. We recommend thorough testing in your specific setup before deploying to production. If you encounter any issues or have feedback, please open an issue on our [GitHub repository](https://github.com/altair-graphql/altair/issues).
:::

Altair GraphQL Client supports Content Security Policy (CSP) to enhance the security of your application by preventing various types of attacks such as Cross-Site Scripting (XSS).

## Recommended CSP configuration

To effectively use CSP with Altair, consider the following recommended configuration:

- `default-src 'self';` (restricts loading resources to the same origin by default)
- `base-uri 'self';` (restricts the base URI to the same origin)
- `font-src 'self' https: data:;` (allows fonts to be loaded from the same origin, HTTPS sources, and data URIs)
- `form-action 'self';` (restricts form submissions to the same origin)
- `frame-ancestors 'self';` (restricts embedding of the page to the same origin)
- `img-src 'self' data:;` (allows images to be loaded from the same origin and data URIs)
- `object-src 'none';` (disallows the use of `<object>`, `<embed>`, and `<applet>` elements)
- `script-src-attr 'none';` (disallows inline script attributes)
- `upgrade-insecure-requests;` (automatically upgrades HTTP requests to HTTPS)
- `script-src 'self' 'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I=' 'nonce-<RANDOM_VALUE>';` (allows scripts from the same origin, SHA-256 hash for the initialization script, and scripts with a nonce)
- `style-src 'self' 'nonce-<RANDOM_VALUE>';` (allows styles from the same origin and styles with a nonce)

### Note on Nonces

Nonces are a powerful feature of CSP that allow you to specify which inline scripts and styles are trusted. By generating a unique nonce value for each request and including it in your CSP header, you can permit specific inline scripts and styles to execute while blocking all others. This helps to mitigate the risk of XSS attacks. In the recommended configuration above, replace `<RANDOM_VALUE>` with a securely generated random value for each request.

The nonce is necessary for Altair to function correctly while maintaining a strong security posture, as it uses inline scripts and styles for its UI components. Make sure to generate a new nonce for each request to maintain security.

## Enabling CSP in Altair

To enable CSP in your Altair application, you need to configure the middleware to include the appropriate CSP headers. Here's an example of how to do this in different server environments:

### Express

```javascript
import express from 'express';
import helmet from 'helmet';
import crypto from 'crypto';
import { altairExpress } from 'altair-express-middleware';

const app = express();

app.use((req, res, next) => {
  // Generate a random nonce for each request
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Uses default secure directives plus overrides below
        scriptSrc: [
          "'self'",
          "'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I='",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
        styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      },
    },
  })
);

app.use(
  '/altair',
  altairExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{ getData { id name surname } }`,
    // specify how to get the nonce value for CSP
    cspNonceGenerator: (req, res) => res.locals.cspNonce,
  })
);
```

### Koa

```javascript
import * as Koa from 'koa';
import * as KoaRouter from '@koa/router';
import helmet from 'koa-helmet';
import { randomBytes } from 'crypto';
import { createRouteExplorer } from 'altair-koa-middleware';

const app = new Koa();

app.use(async (ctx, next) => {
  // Generate a random nonce for each request
  ctx.state.cspNonce = randomBytes(16).toString('base64');
  await next();
});
app.use(async (ctx, next) => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        // Uses default secure directives plus overrides below
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
const router = new KoaRouter();

createRouteExplorer({
  url: '/altair',
  router,
  opts: {
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{ getData { id name surname } }`,
    // specify how to get the nonce value for CSP
    cspNonceGenerator: (ctx) => ctx.state.cspNonce,
  },
});
```

### Fastify

```javascript
import fastify from 'fastify';
import helmet from 'fastify-helmet';
import { randomBytes } from 'crypto';
import { fastifyAltair } from 'altair-fastify-plugin';

const app = fastify();

app.addHook('onRequest', async (request, reply) => {
  // Generate a random nonce for each request
  reply.raw.scriptNonce = randomBytes(16).toString('base64');
});
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      // Uses default secure directives plus overrides below
      scriptSrc: [
        "'self'",
        "'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I='",
        (req, raw) => `'nonce-${raw.scriptNonce}'`,
      ],
      styleSrc: ["'self'", (req, raw) => `'nonce-${raw.scriptNonce}'`],
    },
  },
});

app.register(fastifyAltair, {
  path: '/altair',
  baseURL: '/altair/',
  endpointURL: '/graphql',
  // specify how to get the nonce value for CSP
  cspNonceGenerator: (req, reply) => reply.raw.scriptNonce,
});
```
