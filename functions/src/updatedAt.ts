import * as functions from 'firebase-functions';
import { firestore as firestoreFn } from 'firebase-functions';
import { firestore as firestoreAdmin } from 'firebase-admin';

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
      await firestoreAdmin().doc(`query_collections/${collectionId}`).update({
        updatedAt: Date.now(),
      });
    }
  });
