import { FirebaseOptions } from 'firebase/app';
import { FirestoreSettings } from 'firebase/firestore';
export type ClientEnvironment = 'development' | 'production' | 'testing';
export interface APIClientOptions {
  apiBaseUrl: string;
  loginClientUrl: string;
}
export const getClientConfig = (env: ClientEnvironment = 'development') => {
  switch (env) {
    case 'production':
      return {
        apiBaseUrl: 'http://localhost:3000',
        loginClientUrl: 'http://localhost:1234',
      };
  }

  return {
    apiBaseUrl: 'http://localhost:3000',
    loginClientUrl: 'http://localhost:1234',
  };
};
