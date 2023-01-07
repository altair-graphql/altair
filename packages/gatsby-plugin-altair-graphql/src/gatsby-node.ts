import { altairExpress } from 'altair-express-middleware';
import { Application } from 'express';

export const onCreateDevServer = ({ app }: { app: Application }) => {
  app.use(
    '/___altair',
    altairExpress({
      endpointURL: '/___graphql',
      initialQuery: `# GATSBY + ALTAIR GRAPHQL ❤️.\n# Enter your graphQL query here.`,
    })
  );

  console.log(
    '\nYippee! 🎉 Altair GraphQL Client is now running at `/___altair`\n'
  );
};
