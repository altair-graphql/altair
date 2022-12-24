import {
  addDoc,
  doc,
  collection,
  collectionGroup,
  CollectionReference,
  DocumentReference,
  Firestore,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  setDoc,
  WithFieldValue,
  writeBatch
} from "firebase/firestore";
import {
  IRemoteQuery,
  IRemoteQueryCollection
} from "altair-graphql-core/build/types/state/collection.interfaces";
import { User } from "firebase/auth";
import { Team, UserDocument } from "./interfaces";
import {
  BaseDocument,
  CreateDTO
} from "altair-graphql-core/build/types/shared";

const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    ({ id: snap.id, ...snap.data() } as T & { id: string })
});

const dataPoint = <T>(
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
  queryCollections: "query_collections",
  queries: "queries",
  users: "users",
  teams: "teams",
  memberships: "memberships"
};

export const usersRef = (db: Firestore) =>
  dataPoint<UserDocument>(db, collectionNames.users);

export const queryCollectionsRef = (db: Firestore) =>
  dataPoint<IRemoteQueryCollection>(db, collectionNames.queryCollections);

export const queriesRef = (db: Firestore) =>
  dataPoint<IRemoteQuery>(db, collectionNames.queries);

export const teamsRef = (db: Firestore) =>
  dataPoint<Team>(db, collectionNames.teams);

export const now = () => Date.now();

export interface FirebaseUtilsContext {
  user: User;
  db: Firestore;
}

export const createUtilsContext = (
  user: User,
  db: Firestore
): FirebaseUtilsContext => ({
  user,
  db
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
