import { firestore as firestoreFn } from 'firebase-functions';
import { firestore as firestoreAdmin } from 'firebase-admin';
import {
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import {
  collectionNames,
  getTeamMembershipId,
  now,
} from '@altairgraphql/firebase-utils';
import type { Team } from 'altair-graphql-core/build/cjs/types/state/account.interfaces';
import { getDocument } from './utils';
import {
  TeamMembership,
  UserDocument,
} from '@altairgraphql/firebase-utils/build/interfaces';

const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) =>
    typeof data === 'undefined' || data === null ? {} : data,
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    ({ id: snap.id, ...snap.data() } as T & { id: string }),
});

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

    const membershipId = getTeamMembershipId(id, uid);
    await firestoreAdmin()
      .doc(`${collectionNames.memberships}/${membershipId}`)
      .withConverter(converter<TeamMembership>())
      .create({
        id: membershipId,
        teamUid: id,
        role: 'owner',
        email: user.email,
        uid,
        created_at: now(),
        updated_at: now(),
      });
  });
