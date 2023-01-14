import { getClientConfig } from '@altairgraphql/firebase-utils';
import pkg from '../../package.json';

export const environment = {
  production: true,
  version: pkg.version,
  serverReady: true,
  firebaseConfig: getClientConfig('production'),
};
