import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

const getCounterFunctions = (documentType: string) => {
  const incrementCounter = functions.firestore
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
      await firestore()
        .doc(`users/${uid}/counters/${documentType}`)
        .set(
          {
            val: firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
    });

  const decrementCounter = functions.firestore
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
      await firestore()
        .doc(`users/${uid}/counters/${documentType}`)
        .set(
          {
            val: firestore.FieldValue.increment(-1),
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
export const updateQueryCollectionUpdatedAt = functions.firestore
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
      await firestore().doc(`query_collections/${collectionId}`).set({
        updatedAt: Date.now(),
      });
    }
  });
