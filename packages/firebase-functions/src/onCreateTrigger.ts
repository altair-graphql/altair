import { firestore as firestoreFn } from 'firebase-functions';
import { firestore as firestoreAdmin } from 'firebase-admin';
import { collectionNames, getTeamMembershipId } from 'altair-firebase-utils';
import type { Team } from 'altair-graphql-core/build/cjs/types/state/account.interfaces';
import { getDocument } from './utils';
import {
  TeamMembership,
  UserDocument,
} from 'altair-firebase-utils/build/interfaces';

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

    const user = await getDocument<UserDocument>(
      firestoreAdmin().doc(`${collectionNames.users}/${uid}`)
    );
    if (!user) {
      throw new Error(
        `Cannot find user with id: ${uid}, that owns team (${id})`
      );
    }

    await firestoreAdmin()
      .doc(`${collectionNames.memberships}/${getTeamMembershipId(id, uid)}`)
      .set(
        <TeamMembership>{
          teamUid: id,
          role: 'owner',
          email: user.email,
        },
        { merge: true }
      );
  });
