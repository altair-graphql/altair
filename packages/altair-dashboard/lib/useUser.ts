import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { initializeClient, IUserProfile } from '@altairgraphql/api-utils';

export const apiClient = initializeClient(
  process.env.NODE_ENV === 'production' ? 'production' : 'development'
);

export default function useUser({
  redirectTo = '/login',
  redirectIfFound = false,
} = {}) {
  const router = useRouter();
  const [user, setUser] = useState<IUserProfile | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const user = await apiClient.getUser();
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
  };
}
