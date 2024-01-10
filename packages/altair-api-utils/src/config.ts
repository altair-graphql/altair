export type ClientEnvironment = 'development' | 'production' | 'testing';
export interface APIClientOptions {
  apiBaseUrl: string;
  loginClientUrl: string;
}
export const getClientConfig = (
  env: ClientEnvironment = 'development'
): APIClientOptions => {
  switch (env) {
    case 'production':
      return {
        apiBaseUrl:
          process.env.ALTAIR_API_CLIENT_BASE_URL ??
          'https://api.altairgraphql.dev',
        loginClientUrl:
          process.env.ALTAIR_API_CLIENT_LOGIN_CLIENT_URL ??
          'https://redir.altairgraphql.dev',
      };
  }

  return {
    apiBaseUrl: 'http://localhost:3000',
    loginClientUrl: 'http://localhost:1234',
  };
};
