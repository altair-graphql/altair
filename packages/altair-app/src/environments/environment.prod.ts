import { getClientConfig } from '@altairgraphql/api-utils';
import pkg from '../../package.json';

export const environment = {
  production: true,
  version: pkg.version,
  serverReady: true,
};
