import pkg from '../../package.json';

export const environment = {
  production: true,
  version: pkg.version,
  serverReady: false,
  supabase: {
    publicUrl: 'https://pdfdnnhkxsrfvyhksaop.supabase.co',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyMzU4MDIwLCJleHAiOjE5NTc5MzQwMjB9.4SDcU2t37R6KfcGRxloHtqvq_62FhdgT3P9eWBL7Rpc',
  },
};
