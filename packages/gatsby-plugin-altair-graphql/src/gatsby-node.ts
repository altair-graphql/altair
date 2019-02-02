import { altairExpress } from 'altair-express-middleware';

export const onCreateDevServer = ({ app }) => {
  app.use('/___altair', altairExpress({
    endpointURL: '/___graphql',
    initialQuery: `# GATSBY + ALTAIR GRAPHQL ❤️.\n# Enter your graphQL query here.`,
  }));

  console.log('\nYippee! 🎉 Altair GraphQL Client is now running at `/___altair`\n');
};
