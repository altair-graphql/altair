import { getClientConfig } from '@altairgraphql/api-utils';
import pkg from '../../package.json';

export const environment = {
  production: true,
  version: pkg.version,
  serverReady: true,
  firebaseConfig: getClientConfig('production'),
  authPopupUrl: 'https://redir.altairgraphql.dev',
  apiBaseUrl: 'https://api.altairgraphql.dev',
};
