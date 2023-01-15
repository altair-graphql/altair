import { firestore as firestoreFn } from 'firebase-functions';
import { firestore as firestoreAdmin } from 'firebase-admin';
import {
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { collectionNames } from '@altairgraphql/firebase-utils';
import { IRemoteQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';

const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) =>
    typeof data === 'undefined' || data === null ? {} : data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    ({ id: snap.id, ...snap.data() } as T & { id: string }),
});

// when a query collection is deleted
export const onDeleteQueryCollection = firestoreFn
  .document(`${collectionNames.queryCollections}/{itemId}`)
  .onDelete(async (snapshot) => {
    const id = snapshot.id;

    //  Delete all related queries
    const queries = await firestoreAdmin()
      .collection(`${collectionNames.queries}`)
      .withConverter(converter<IRemoteQuery>())
      .where('collectionUid', '==', id)
      .get();

    const batch = firestoreAdmin().batch();

    queries.docs.map((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
  });
