import express from 'express';
import { altairExpress } from '../../packages/altair-express-middleware/build';
const app = express();
app.disable('x-powered-by');
const port = 3000;

// Mount your Altair GraphQL client
app.use(
  '/altair',
  altairExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
    initialQuery: `{ getData { id name surname } }`,
    initialAuthorization: {
      type: 'api-key',
      data: {
        headerName: 'X-API-KEY',
        headerValue: 'my-secret-token',
      },
    },
    initialSubscriptionRequestHandlerId: 'graphql-sse',
  })
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
