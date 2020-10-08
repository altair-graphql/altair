import Fastify from 'fastify';
import mercurius from 'mercurius';
// import AltairFastify from "altair-fastify-plugin";
import AltairFastify from '../dist';

const app = Fastify({
  logger: {
    level: 'info',
  },
});

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`;

const resolvers = {
  Query: {
    add: async (_: unknown, { x, y }: { x: number; y: number }) => x + y,
  },
};

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: false,
  ide: false,
  path: '/graphql',
});

app.register(AltairFastify, {
  /**
   * All these are the defaults.
   */
  path: '/altair',
  baseURL: '/altair/',
  endpointURL: '/graphql',

  /**
   * Check all the options Altair has
   */
  initialQuery: `
  query {
    add(x: 1, y: 2)
  }
  `,
});

app.listen(3000);
