import * as functions from 'firebase-functions';
import { firestore as firestoreFn } from 'firebase-functions';
import { firestore as firestoreAdmin } from 'firebase-admin';

const getCounterFunctions = (documentType: string) => {
  const incrementCounter = firestoreFn
    .document(`${documentType}/{itemId}`)
    .onCreate(async (snapshot) => {
      const uid = snapshot.data().ownerUid;
      if (!uid) {
        console.warn(
          `${documentType} with id: ${snapshot.id} was created without an authenticated user.`
        );
        return;
      }
      console.log(`incrementing ${documentType} for ${uid}`);
      await firestoreAdmin()
        .doc(`users/${uid}/counters/${documentType}`)
        .set(
          {
            val: firestoreAdmin.FieldValue.increment(1),
          },
          { merge: true }
        );
    });

  const decrementCounter = firestoreFn
    .document(`${documentType}/{itemId}`)
    .onDelete(async (snapshot) => {
      const uid = snapshot.data().ownerUid;
      if (!uid) {
        console.warn(
          `${documentType} with id: ${snapshot.id} was created without an authenticated user.`
        );
        return;
      }
      console.log(`decrementing ${documentType} for ${uid}`);
      await firestoreAdmin()
        .doc(`users/${uid}/counters/${documentType}`)
        .set(
          {
            val: firestoreAdmin.FieldValue.increment(-1),
          },
          { merge: true }
        );
    });

  return [incrementCounter, decrementCounter];
};

export const [incrementQueryCounter, decrementQueryCounter] =
  getCounterFunctions('queries');

export const [
  incrementQueryCollectionCounter,
  decrementQueryCollectionCounter,
] = getCounterFunctions('query_collections');

// update the updatedAt value of the query collection after updating a query that belongs to the collection
export const updateQueryCollectionUpdatedAt = firestoreFn
  .document(`queries/{queryId}`)
  .onUpdate(async (change) => {
    const before = change.before.exists ? change.before.data() : undefined;
    const after = change.after.exists ? change.after.data() : undefined;

    const collectionIds = new Set(
      [before?.collectionId, after?.collectionId].filter(Boolean)
    );

    if (!collectionIds.size) {
      console.warn(
        `query with id: ${change.before.id} was created without a collection ID.`
      );
      return;
    }

    for (const collectionId of collectionIds) {
      await firestoreAdmin().doc(`query_collections/${collectionId}`).set(
        {
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  });
