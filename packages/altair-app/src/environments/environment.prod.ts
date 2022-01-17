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
  supabase: {
    publicUrl: 'https://pdfdnnhkxsrfvyhksaop.supabase.co',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyMzU4MDIwLCJleHAiOjE5NTc5MzQwMjB9.4SDcU2t37R6KfcGRxloHtqvq_62FhdgT3P9eWBL7Rpc',
  },
};
