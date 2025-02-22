import { ConfigEnvironment } from './environment';

export interface UrlConfig {
  api: string;
  loginClient: string;
  sandbox: string;
  docs: string;
}

export const urlMap: Record<ConfigEnvironment, UrlConfig> = {
  development: {
    api: 'http://localhost:3000',
    loginClient: 'http://localhost:1234',
    sandbox: 'http://localhost:5123',
    docs: 'http://localhost:6025',
  },
  production: {
    api: process.env.ALTAIR_API_CLIENT_BASE_URL ?? 'https://api.altairgraphql.dev',
    loginClient:
      process.env.ALTAIR_API_CLIENT_LOGIN_CLIENT_URL ??
      'https://redir.altairgraphql.dev',
    sandbox:
      process.env.ALTAIR_API_CLIENT_SANDBOX_URL ??
      'https://sandbox.altairgraphql.dev',
    docs: process.env.ALTAIR_API_CLIENT_DOCS_URL ?? 'https://altairgraphql.dev',
  },
  testing: {
    api: 'http://localhost:3000',
    loginClient: 'http://localhost:1234',
    sandbox: 'http://localhost:5123',
    docs: 'http://localhost:6025',
  },
};
