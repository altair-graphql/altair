import { environment } from 'environments/environment';
import {
  CollectionReference,
  addDoc,
  WithFieldValue,
  setDoc,
  DocumentReference,
  PartialWithFieldValue,
} from 'firebase/firestore';
import { initializeClient } from '@altairgraphql/firebase-utils';

export const firebaseClient = initializeClient(
  environment.production ? 'production' : 'development'
);

interface BaseDocument {
  created_at?: number;
  updated_at?: number;
}

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
