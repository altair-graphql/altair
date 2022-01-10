import pkg from '../../package.json';

export const environment = {
  production: true,
  version: pkg.version,
  serverReady: false,
  auth0: {
    apiUrl: 'http://localhost:3000/graphql',
    audience: 'https://api.altairgraphql.io',
    domain: 'https://altairgraphql.us.auth0.com',
    client_id: 'ZGuDZpt3ELc6XEGCYQcj2vOWV3fWIyLn',
  },
};
