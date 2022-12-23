import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  CollectionReference,
  DocumentReference,
  Firestore,
  initializeFirestore,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  setDoc,
  WithFieldValue
} from "firebase/firestore";
import {
  IQuery,
  IQueryCollection,
  IRemoteQuery,
  IRemoteQueryCollection
} from "altair-graphql-core/build/types/state/collection.interfaces";
import { User } from "firebase/auth";

const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    ({ id: snap.id, ...snap.data() } as T & { id: string })
});

const dataPoint = <T>(
  db: Firestore,
  path: string,
  ...collectionPaths: string[]
) =>
  collection(db, path, ...collectionPaths).withConverter(
    converter<T & { id?: string }>()
  );

// TODO: Move to firebase-utils package and reuse in functions
export const collectionNames = {
  queryCollections: "query_collections",
  queries: "queries",
  users: "users"
};

interface BaseDocument {
  created_at?: number;
  updated_at?: number;
}

interface UserDocument extends BaseDocument {
  name: string;
  email: string;
}

export const usersRef = (db: Firestore) =>
  dataPoint<UserDocument>(db, collectionNames.users);

export const queryCollectionsRef = (db: Firestore) =>
  dataPoint<IRemoteQueryCollection>(db, collectionNames.queryCollections);

export const queriesRef = (db: Firestore) =>
  dataPoint<IRemoteQuery>(db, collectionNames.queries);

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
  return setDoc(docRef, { ...data, updated_at: Date.now() }, { merge: true });
};

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
