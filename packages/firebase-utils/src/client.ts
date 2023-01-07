import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User, Auth } from 'firebase/auth';
import {
  ClientEnvironment,
  getClientConfig,
  getFirestoreSettings,
} from './config';

export const getUser = (auth: Auth) => {
  return new Promise<User | null>((resolve, reject) => {
    const cleanup = onAuthStateChanged(
      auth,
      (user) => {
        resolve(user);
      },
      (error) => reject(error)
    );

    return cleanup();
  });
};

export const initializeClient = (env: ClientEnvironment = 'development') => {
  const config = getClientConfig(env);
  const app = initializeApp(config);

  const db = initializeFirestore(app, getFirestoreSettings());
  const auth = getAuth(app);

  return {
    app,
    db,
    auth,
    getUser() {
      return getUser(auth);
    },
  };
};
