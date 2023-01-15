import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  createUtilsContext,
  initializeClient,
} from '@altairgraphql/firebase-utils';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';

export const firebaseClient = initializeClient();

const useAuthState = (auth: Auth) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const cleanup = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      cleanup();
    };
  }, [auth]);
};

export default function useUser({
  redirectTo = '/login',
  redirectIfFound = false,
} = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const user = await firebaseClient.getUser();
      setUser(user);
      // if no redirect needed, just return (example: already on /dashboard)
      // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
      if (!redirectTo) return;

      if (
        // If redirectTo is set, redirect if the user was not found.
        (redirectTo && !redirectIfFound && !user) ||
        // If redirectIfFound is also set, redirect if the user was found
        (redirectIfFound && user)
      ) {
        if (router.pathname !== redirectTo) {
          // console.log(router.pathname, redirectTo);
          router.push(redirectTo);
        }
      }
    })();
  }, [redirectIfFound, redirectTo, router]);

  return {
    user,
    ctx: user ? createUtilsContext(user, firebaseClient.db) : null,
  };
}
