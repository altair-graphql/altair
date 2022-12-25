import { CreateDTO, UpdateDTO } from "altair-graphql-core/build/types/shared";
import { Team } from "altair-graphql-core/build/types/state/account.interfaces";
import {
  writeBatch,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  documentId
} from "firebase/firestore";
import { TeamMembership } from "./interfaces";
import {
  collectionNames,
  FirebaseUtilsContext,
  groupDataPoint,
  now,
  teamsRef,
  updateDocument
} from "./utils";

export const createTeam = async (
  ctx: FirebaseUtilsContext,
  data: CreateDTO<Team>
) => {
  const batch = writeBatch(ctx.db);
  const newTeamRef = doc(teamsRef(ctx.db));

  batch.set(newTeamRef, {
    ...data,
    id: newTeamRef.id,
    ownerUid: ctx.user.uid,
    created_at: now(),
    updated_at: now()
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
  const ownerQ = query(teamsRef(ctx.db), where("ownerUid", "==", ctx.user.uid));

  const ownerTeamsSnapshot = await getDocs(ownerQ);
  const ownerTeams = ownerTeamsSnapshot.docs.map(_ => _.data());

  const memberQ = query(
    groupDataPoint<TeamMembership>(ctx.db, collectionNames.memberships),
    where("ownerUid", "==", ctx.user.uid)
  );

  const membershipsSnapshot = await getDocs(memberQ);
  // Extract team IDs from memberships. Filter out owned teams (since we already fetched them above)
  const membershipTeamIds = membershipsSnapshot.docs
    .map(_ => _.data().teamUid)
    .filter(teamId => !ownerTeams.find(t => t.id === teamId));

  if (membershipTeamIds.length === 0) {
    return ownerTeams;
  }

  const q = query(
    teamsRef(ctx.db),
    where(documentId(), "in", membershipTeamIds)
  );
  const sn = await getDocs(q);

  return sn.docs.map(_ => _.data()).concat(ownerTeams);
};
