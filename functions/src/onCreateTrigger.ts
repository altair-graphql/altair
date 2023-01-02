import { firestore as firestoreFn } from 'firebase-functions';
import {
  collectionNames,
  addTeamMember,
  FirebaseUtilsContext,
  getUserData,
} from 'altair-firebase-utils';
import { getFirestore } from 'firebase/firestore';
import type { Team } from 'altair-graphql-core/build/cjs/types/state/account.interfaces';

// when a team is created
export const onCreateTeam = firestoreFn
  .document(`${collectionNames.teams}/{itemId}`)
  .onCreate(async (snapshot, ctx) => {
    const id = snapshot.id;
    const data = snapshot.data() as Team;
    const uid = data.ownerUid;

    // add team owner as first team member
    if (!uid) {
      throw new Error(
        `team with id: ${snapshot.id} was created without an authenticated user.`
      );
    }

    const utilsCtx: FirebaseUtilsContext = {
      uid,
      db: getFirestore(),
    };

    const user = await getUserData(utilsCtx, uid);

    if (!user) {
      throw new Error(
        `Cannot find user with id: ${uid}, that owns team (${id})`
      );
    }

    await addTeamMember(utilsCtx, {
      teamUid: id,
      role: 'owner',
      email: user.email,
    });
  });
