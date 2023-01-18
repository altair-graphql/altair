import {
  addDoc,
  collection,
  collectionGroup,
  CollectionReference,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  setDoc,
  WithFieldValue,
} from 'firebase/firestore';
import {
  IRemoteQuery,
  IRemoteQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { User } from 'firebase/auth';
import { TeamMembership, UserDocument } from './interfaces';
import { BaseDocument } from 'altair-graphql-core/build/types/shared';
import { Team } from 'altair-graphql-core/build/types/state/account.interfaces';

export const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) =>
    typeof data === 'undefined' || data === null ? {} : data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    ({ id: snap.id, ...snap.data() } as T & { id: string }),
});

export const dataPoint = <T>(
  db: Firestore,
  path: string,
  ...collectionPaths: string[]
) => collection(db, path, ...collectionPaths).withConverter(converter<T>());

/**
 * typed collectionGroup
 */
export const groupDataPoint = <T>(db: Firestore, path: string) =>
  collectionGroup(db, path).withConverter(converter<T>());

export const collectionNames = {
  queryCollections: 'query_collections',
  queries: 'queries',
  users: 'users',
  teams: 'teams',
  memberships: 'team_memberships',
};

export const usersRef = (db: Firestore) =>
  dataPoint<UserDocument>(db, collectionNames.users);

export const queryCollectionsRef = (db: Firestore) =>
  dataPoint<IRemoteQueryCollection>(db, collectionNames.queryCollections);

export const queriesRef = (db: Firestore) =>
  dataPoint<IRemoteQuery>(db, collectionNames.queries);

export const teamsRef = (db: Firestore) =>
  dataPoint<Team>(db, collectionNames.teams);

export const teamMembersRef = (db: Firestore) =>
  dataPoint<TeamMembership>(db, collectionNames.memberships);

export const now = () => Date.now();

export interface FirebaseUtilsContext {
  uid: string;
  db: Firestore;
}

export const createUtilsContext = (
  user: User,
  db: Firestore
): FirebaseUtilsContext => ({
  uid: user.uid,
  db,
});

export const addDocument = <T>(
  collectionRef: CollectionReference<T>,
  data: WithFieldValue<T>
) => {
  return addDoc(collectionRef, data);
};

export const updateDocument = <T extends BaseDocument>(
  docRef: DocumentReference<T>,
  data: PartialWithFieldValue<T>
) => {
  return setDoc(docRef, { ...data, updated_at: now() }, { merge: true });
};

export const getDocument = async <T extends BaseDocument>(
  ctx: FirebaseUtilsContext,
  collectionRef: CollectionReference<T>,
  id: string
): Promise<T | undefined> => {
  const snapshot = await getDoc(doc(collectionRef, id));
  const data = snapshot.data();

  if (!data) {
    return;
  }

  return {
    ...data,
    id: snapshot.id,
  };
};
