const Fastify = require('fastify');
const GQL = require('fastify-gql');
// const AltairFastify = require("altair-fastify-plugin");
const AltairFastify = require('../');

const app = Fastify();

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`;

const resolvers = {
  Query: {
    add: async (_, { x, y }) => x + y,
  },
};

app.register(GQL, {
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
  baseUrl: '/altair/',
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

app.get('/', async function (req, reply) {
  const query = '{ add(x: 2, y: 2) }';
  return reply.graphql(query);
});

app.listen(3000);
