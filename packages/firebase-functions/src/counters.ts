import { firestore as firestoreFn } from 'firebase-functions';
import { firestore as firestoreAdmin } from 'firebase-admin';
import { collectionNames } from '@altairgraphql/firebase-utils';

const getCounterFunctions = (documentType: string) => {
  const incrementCounter = firestoreFn
    .document(`${documentType}/{itemId}`)
    .onCreate(async (snapshot) => {
      const id = snapshot.id;
      const data = snapshot.data();
      const uid = data.ownerUid;
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
      await firestoreAdmin()
        .doc(`users/${uid}/meta/${documentType}`)
        .set(
          {
            items: firestoreAdmin.FieldValue.arrayUnion(id),
          },
          { merge: true }
        );

      if (data.teamUid) {
        const teamUid = data.teamUid;
        console.log(`adding ${documentType} to team ${teamUid}`);
        await firestoreAdmin()
          .doc(`teams/${teamUid}/meta/${documentType}`)
          .set(
            {
              items: firestoreAdmin.FieldValue.arrayUnion(id),
            },
            { merge: true }
          );
      }
    });

  const decrementCounter = firestoreFn
    .document(`${documentType}/{itemId}`)
    .onDelete(async (snapshot) => {
      const id = snapshot.id;
      const data = snapshot.data();
      const uid = data.ownerUid;
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
      await firestoreAdmin()
        .doc(`users/${uid}/meta/${documentType}`)
        .set(
          {
            items: firestoreAdmin.FieldValue.arrayRemove(id),
          },
          { merge: true }
        );

      if (data.teamUid) {
        const teamUid = data.teamUid;
        console.log(`adding ${documentType} to team ${teamUid}`);
        await firestoreAdmin()
          .doc(`teams/${teamUid}/meta/${documentType}`)
          .set(
            {
              items: firestoreAdmin.FieldValue.arrayRemove(id),
            },
            { merge: true }
          );
      }
    });

  return [incrementCounter, decrementCounter];
};

export const [incrementQueryCounter, decrementQueryCounter] =
  getCounterFunctions('queries');

export const [
  incrementQueryCollectionCounter,
  decrementQueryCollectionCounter,
] = getCounterFunctions('query_collections');

export const [incrementTeamCounter, decrementTeamCounter] =
  getCounterFunctions('teams');

const getTeamCounterFunctions = (documentType: string) => {
  const incrementCounter = firestoreFn
    .document(`${documentType}/{itemId}`)
    .onCreate(async (snapshot) => {
      const data = snapshot.data();
      const teamId = data.teamUid;
      if (!teamId) {
        console.warn(
          `${documentType} with id: ${snapshot.id} was created without an owning team.`
        );
        return;
      }
      console.log(`incrementing ${documentType} for team (${teamId})`);
      await firestoreAdmin()
        .doc(`${collectionNames.teams}/${teamId}/counters/${documentType}`)
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
      const data = snapshot.data();
      const teamId = data.teamUid;
      if (!teamId) {
        console.warn(
          `${documentType} with id: ${snapshot.id} was deleted without an owning team.`
        );
        return;
      }
      console.log(`decrementing ${documentType} for team (${teamId})`);
      await firestoreAdmin()
        .doc(`${collectionNames.teams}/${teamId}/counters/${documentType}`)
        .set(
          {
            val: firestoreAdmin.FieldValue.increment(-1),
          },
          { merge: true }
        );
    });

  return [incrementCounter, decrementCounter];
};

export const [incrementTeamMemberCounter, decrementTeamMemberCounter] =
  getTeamCounterFunctions(collectionNames.memberships);
