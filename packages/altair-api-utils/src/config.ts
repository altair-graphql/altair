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
        apiBaseUrl: 'https://api.altairgraphql.dev',
        loginClientUrl: 'https://redir.altairgraphql.dev',
      };
  }

  return {
    apiBaseUrl: 'http://localhost:3000',
    loginClientUrl: 'http://localhost:1234',
  };
};
