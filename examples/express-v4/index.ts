import express from 'express';
import { altairExpress } from '../../packages/altair-express-middleware/build';
import helmet from 'helmet';
import crypto from 'crypto';
const app = express();
app.disable('x-powered-by');
const port = 3002;

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        scriptSrc: [
          "'self'",
          "'sha256-kFTKSG2YSVB69S6DWzferO6LmwbqfHmYBTqvVbPEp4I='",
          (req, res) => `'nonce-${(res as any).locals.cspNonce}'`,
        ],
        styleSrc: [
          "'self'",
          (req, res) => `'nonce-${(res as any).locals.cspNonce}'`,
        ],
      },
    },
  })
);
// Mount your Altair GraphQL client
app.use(
  '/altair',
  altairExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{
      getData {
        id
        name
        surname
      }
    }`,
    initialAuthorization: {
      type: 'api-key',
      data: {
        headerName: 'X-API-KEY',
        headerValue: 'my-secret-token',
      },
    },
    initialSubscriptionRequestHandlerId: 'graphql-sse',
    serveInitialOptionsInSeperateRequest: true,
    cspNonceGenerator: (req, res) => res.locals.cspNonce,
  })
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on: http://localhost:${port}`);
});
