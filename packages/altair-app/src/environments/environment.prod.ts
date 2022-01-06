import pkg from '../../package.json';

export const environment = {
  production: true,
  version: pkg.version,
  apiUrl: 'http://localhost:3000/graphql',
};
