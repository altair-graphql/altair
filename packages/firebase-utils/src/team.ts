import { CreateDTO, UpdateDTO } from 'altair-graphql-core/build/types/shared';
import {
  Team,
  TeamId,
} from 'altair-graphql-core/build/types/state/account.interfaces';
import {
  writeBatch,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  documentId,
} from 'firebase/firestore';
import { TeamMembership } from './interfaces';
import { getUserDataByEmail } from './user';
import {
  collectionNames,
  FirebaseUtilsContext,
  groupDataPoint,
  now,
  teamMembersRef,
  teamsRef,
  updateDocument,
} from './utils';

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export type UpdateTeamDto = Partial<CreateTeamDto>;

export const createTeam = async (
  ctx: FirebaseUtilsContext,
  data: CreateDTO<Team>
) => {
  const batch = writeBatch(ctx.db);
  const newTeamRef = doc(teamsRef(ctx.db));

  batch.set(newTeamRef, {
    ...data,
    id: newTeamRef.id,
    // ownerUid: ctx.uid,
    // created_at: now(),
    // updated_at: now(),
  });

  await batch.commit();

  return newTeamRef.id;
};

export const updateTeam = async (
  ctx: FirebaseUtilsContext,
  teamId: string,
  data: UpdateDTO<Team>
) => {
  await updateDocument<Team>(doc(teamsRef(ctx.db), teamId), data);
};

export const deleteTeam = async (ctx: FirebaseUtilsContext, teamId: string) => {
  await deleteDoc(doc(teamsRef(ctx.db), teamId));
};

export const getTeams = async (ctx: FirebaseUtilsContext) => {
  // Get all teams where user is a member/owner
  const ownerQ = query(teamsRef(ctx.db), where('ownerUid', '==', ctx.uid));

  const ownerTeamsSnapshot = await getDocs(ownerQ);
  const ownerTeams = ownerTeamsSnapshot.docs.map((_) => _.data());

  const memberQ = query(teamMembersRef(ctx.db), where('uid', '==', ctx.uid));

  const membershipsSnapshot = await getDocs(memberQ);
  // Extract team IDs from memberships. Filter out owned teams (since we already fetched them above)
  const membershipTeamIds = membershipsSnapshot.docs
    .map((_) => _.data().teamUid)
    .filter((teamId) => !ownerTeams.find((t) => t.id === teamId));

  if (membershipTeamIds.length === 0) {
    return ownerTeams;
  }

  const q = query(
    teamsRef(ctx.db),
    where(documentId(), 'in', membershipTeamIds)
  );
  const sn = await getDocs(q);

  return sn.docs.map((_) => _.data()).concat(ownerTeams);
};

export const getTeamMembershipId = (teamId: string, userId: string) =>
  `${teamId}:${userId}`;

export const addTeamMember = async (
  ctx: FirebaseUtilsContext,
  data: Omit<CreateDTO<TeamMembership>, 'uid'>
) => {
  const user = await getUserDataByEmail(ctx, data.email);
  if (!user) {
    throw new Error('User not found!');
  }

  if (user.email !== data.email) {
    throw new Error('User email must match!');
  }

  const batch = writeBatch(ctx.db);
  const newTeamMemberRef = doc(
    teamMembersRef(ctx.db),
    getTeamMembershipId(data.teamUid, user.id)
  );

  batch.set(newTeamMemberRef, {
    ...data,
    id: newTeamMemberRef.id,
    uid: user.id,
    created_at: now(),
    updated_at: now(),
  });

  await batch.commit();

  return newTeamMemberRef.id;
};

export const getTeamMembers = async (
  ctx: FirebaseUtilsContext,
  teamId: TeamId
) => {
  const q = query(
    teamMembersRef(ctx.db),
    where('teamUid', '==', teamId.value())
  );
  const teamMembersSnapshot = await getDocs(q);

  return teamMembersSnapshot.docs.map((_) => _.data());
};
