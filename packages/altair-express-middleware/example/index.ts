import * as express from 'express';
import { altairExpress } from '../index';

const app = express();
const port = 3030;

app.use('/altair', altairExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:5400/subscriptions`,
  initialQuery: `{ getData { id name surname } }`,
  // serveInitialOptionsInSeperateRequest: true,
  initialPreRequestScript: `console.log('Hello from pre request!')`,
}));
app.get('/', (req, res) => res.send('Hello world'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
