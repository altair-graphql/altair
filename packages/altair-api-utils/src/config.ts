export type ClientEnvironment = 'development' | 'production' | 'testing';
export interface APIClientOptions {
  apiBaseUrl: string;
  loginClientUrl: string;
  sandboxUrl: string;
}
export const getClientConfig = (
  env: ClientEnvironment = 'development'
): APIClientOptions => {
  switch (env) {
    case 'production':
      return {
        apiBaseUrl:
          process.env.ALTAIR_API_CLIENT_BASE_URL ?? 'https://api.altairgraphql.dev',
        loginClientUrl:
          process.env.ALTAIR_API_CLIENT_LOGIN_CLIENT_URL ??
          'https://redir.altairgraphql.dev',
        sandboxUrl:
          process.env.ALTAIR_API_CLIENT_SANDBOX_URL ??
          'https://sandbox.altairgraphql.dev',
      };
  }

  return {
    apiBaseUrl: 'http://localhost:3000',
    loginClientUrl: 'http://localhost:1234',
    sandboxUrl: 'http://localhost:5123',
  };
};
