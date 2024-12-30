import { createSchema, createYoga } from 'graphql-yoga';
import express from 'express';
import { createServer } from 'http';
import { resolvers, typeDefs } from './schema';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

export const yogaMain = async () => {
  const schema = createSchema({
    typeDefs: typeDefs,
    resolvers: resolvers,
  });

  const yoga = createYoga({
    schema,
    batching: true,
    logging: 'debug',
    multipart: true,
    plugins: [useDeferStream(), useGraphQLSSE()],
  });

  const app = express();

  app.use(async (req, res, next) => {
    console.log(req.headers);
    console.log(req.cookies);
    res.set('x-auth', 'text/plain');
    // await delay(5000);
    return next();
  });
  app.use(yoga.graphqlEndpoint, yoga);

  const server = createServer(app);

  const wsServer = new WebSocketServer({
    server,
    path: yoga.graphqlEndpoint,
  });

  // Integrate Yoga's Envelop instance and NodeJS server with graphql-ws
  useServer(
    {
      execute: (args: any) => args.rootValue.execute(args),
      subscribe: (args: any) => args.rootValue.subscribe(args),
      onSubscribe: async (ctx, msg) => {
        const { schema, execute, subscribe, contextFactory, parse, validate } =
          yoga.getEnveloped({
            ...ctx,
            req: ctx.extra.request,
            socket: ctx.extra.socket,
            params: msg.payload,
          });

        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe,
          },
        };

        const errors = validate(args.schema, args.document);
        if (errors.length) return errors;
        return args;
      },
    },
    wsServer
  );

  server.listen(5400, () => {
    console.log('Server is running on http://localhost:5400');
  });
};
