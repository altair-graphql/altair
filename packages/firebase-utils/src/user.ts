import { getDocs, query, where } from 'firebase/firestore';
import { FirebaseUtilsContext, getDocument, usersRef } from './utils';

export interface Token {
  accessToken: string;
  refreshToken: string;
}
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  picture?: string;
  tokens: Token;
}

export const getUserData = async (ctx: FirebaseUtilsContext, uid: string) => {
  return getDocument(ctx, usersRef(ctx.db), uid);
};

export const getUserDataByEmail = async (
  ctx: FirebaseUtilsContext,
  email: string
) => {
  const snapshots = await getDocs(
    query(usersRef(ctx.db), where('email', '==', email))
  );
  if (snapshots.empty) {
    return;
  }

  const snapshot = snapshots.docs[0];

  if (!snapshot) {
    return;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
};
