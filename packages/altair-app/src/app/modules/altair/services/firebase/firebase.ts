import { environment } from 'environments/environment';
import {
  QueryDocumentSnapshot,
  collection,
  CollectionReference,
  addDoc,
  WithFieldValue,
  setDoc,
  DocumentReference,
  PartialWithFieldValue,
} from 'firebase/firestore';
import {
  IRemoteQuery,
  IRemoteQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { collectionNames, initializeClient } from 'altair-firebase-utils';

export const firebaseClient = initializeClient(
  environment.production ? 'production' : 'development'
);

const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    ({ id: snap.id, ...snap.data() } as T & { id: string }),
});

const dataPoint = <T>(path: string, ...collectionPaths: string[]) =>
  collection(firebaseClient.db, path, ...collectionPaths).withConverter(
    converter<T & { id?: string }>()
  );

interface BaseDocument {
  created_at?: number;
  updated_at?: number;
}

interface UserDocument extends BaseDocument {
  name: string;
  email: string;
}

export const usersRef = () => dataPoint<UserDocument>(collectionNames.users);

export const queryCollectionsRef = () =>
  dataPoint<IRemoteQueryCollection>(collectionNames.queryCollections);

export const queriesRef = () =>
  dataPoint<IRemoteQuery>(collectionNames.queries);

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
