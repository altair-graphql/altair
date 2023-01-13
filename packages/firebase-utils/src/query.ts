import {
  deleteDoc,
  doc,
  WriteBatch,
  writeBatch,
  query,
  where,
  getDoc,
  getDocs,
  documentId,
} from 'firebase/firestore';
import {
  IQuery,
  IQueryCollection,
  IRemoteQuery,
  IRemoteQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import {
  FirebaseUtilsContext,
  getDocument,
  now,
  queriesRef,
  queryCollectionsRef,
  updateDocument,
} from './utils';
import { CreateDTO } from 'altair-graphql-core/build/types/shared';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';
import { getTeams } from './team';

export const createQueryCollection = async (
  ctx: FirebaseUtilsContext,
  queryCollection: CreateDTO<IQueryCollection>,
  parentCollectionId?: string,
  teamId?: TeamId
) => {
  const batch = writeBatch(ctx.db);
  const newCollectionRef = doc(queryCollectionsRef(ctx.db));
  batch.set(newCollectionRef, {
    title: queryCollection.title,
    parentCollectionId: parentCollectionId,
    ownerUid: ctx.uid,
    teamUid: teamId?.value(),
    id: newCollectionRef.id,
    created_at: now(),
    updated_at: now(),
  });

  const { queryIds } = await createQueriesToBatch(
    ctx,
    newCollectionRef.id,
    queryCollection.queries,
    teamId,
    batch
  );

  await batch.commit();

  return {
    collectionId: newCollectionRef.id,
    queryIds,
  };
};

const createQueriesToBatch = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string,
  queries: IQuery[],
  teamId?: TeamId,
  batch?: WriteBatch
) => {
  let extractedTeamId = teamId?.value();
  if (!teamId) {
    const collection = await getRemoteCollection(ctx, collectionServerId);
    extractedTeamId = collection?.teamUid;
  }

  batch = batch ?? writeBatch(ctx.db);

  const queryRes = [];
  for (const query of queries) {
    const newQueryRef = doc(queriesRef(ctx.db));
    batch.set(newQueryRef, {
      ...query,
      id: newQueryRef.id,
      windowName: query.windowName,
      version: query.version,
      collectionId: collectionServerId,
      ownerUid: ctx.uid,
      teamUid: extractedTeamId,
      created_at: now(),
      updated_at: now(),
    });

    queryRes.push(newQueryRef.id);
  }

  return { batch, queryIds: queryRes };
};

export const createQueries = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string,
  queries: IQuery[],
  teamId?: TeamId
) => {
  const { queryIds, batch } = await createQueriesToBatch(
    ctx,
    collectionServerId,
    queries,
    teamId
  );

  await batch.commit();

  return queryIds;
};

export const updateQuery = async (
  ctx: FirebaseUtilsContext,
  queryServerId: string,
  query: IQuery
) => {
  await updateDocument<IRemoteQuery>(
    doc(queriesRef(ctx.db), queryServerId),
    query
  );
};

export const deleteQuery = async (
  ctx: FirebaseUtilsContext,
  queryServerId: string
) => {
  await deleteDoc(doc(queriesRef(ctx.db), queryServerId));
};

export const getQuery = async (
  ctx: FirebaseUtilsContext,
  queryServerId: string
) => {
  return getDocument(ctx, queriesRef(ctx.db), queryServerId);
};

export const updateCollection = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string,
  collection: IQueryCollection,
  parentCollectionServerId?: string
) => {
  await updateDocument<IRemoteQueryCollection>(
    doc(queryCollectionsRef(ctx.db), collectionServerId),
    {
      title: collection.title,
      description: collection.description,
      parentCollectionId: parentCollectionServerId,
    }
  );
};

export const deleteCollection = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string
) => {
  await deleteDoc(doc(queryCollectionsRef(ctx.db), collectionServerId));
};

const getRemoteCollection = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string
): Promise<IRemoteQueryCollection | undefined> => {
  const q = query(
    queryCollectionsRef(ctx.db),
    where('ownerUid', '==', ctx.uid),
    where(documentId(), '==', collectionServerId)
  );
  const querySnapshot = await getDoc(
    doc(queryCollectionsRef(ctx.db), collectionServerId)
  );

  if (!querySnapshot) {
    return;
  }
  const data = querySnapshot.data();
  if (!data) {
    return;
  }

  return {
    ...data,
    id: querySnapshot.id,
  };
};

const getCollectionQueries = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string
): Promise<IRemoteQuery[]> => {
  const docQ = query(
    queriesRef(ctx.db),
    where('ownerUid', '==', ctx.uid),
    where('collectionId', '==', collectionServerId)
  );

  const sn = await getDocs(docQ);
  return sn.docs.map(_ => ({ ..._.data(), id: _.id }));
};

export const getCollection = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string
): Promise<IQueryCollection | undefined> => {
  const collection = await getRemoteCollection(ctx, collectionServerId);
  if (!collection) {
    return;
  }

  const queries = await getCollectionQueries(ctx, collectionServerId);

  return {
    ...collection,
    queries,
    storageType: 'firestore',
  };
};

export const getCollections = async (
  ctx: FirebaseUtilsContext
): Promise<IQueryCollection[]> => {
  // Get query collections where owner == uid
  // Get queries where collectionId in collection IDs
  const q = query(
    queryCollectionsRef(ctx.db),
    where('ownerUid', '==', ctx.uid)
  );
  const querySnapshot = await getDocs(q);

  let queryCollections = querySnapshot.docs;

  // check for team collections
  const teams = await getTeams(ctx);
  const teamIds = teams.map(t => t.id);
  if (teams.length) {
    const teamCollectionQ = query(
      queryCollectionsRef(ctx.db),
      where('teamUid', 'in', teamIds)
    );

    const teamCollectionQSnapshot = await getDocs(teamCollectionQ);

    // add team collections to the list
    queryCollections = mergeList(
      queryCollections,
      teamCollectionQSnapshot.docs
    );
  }

  const collectionQueries = await Promise.allSettled(
    queryCollections.map(async col => {
      const docQ = query(
        queriesRef(ctx.db),
        where('ownerUid', '==', ctx.uid),
        where('collectionId', '==', col.id)
      );

      const sn = await getDocs(docQ);

      let queries = sn.docs;
      if (teamIds.length) {
        const teamDocQ = query(
          queriesRef(ctx.db),
          where('collectionId', '==', col.id),
          where('teamUid', 'in', teamIds)
        );

        const teamSn = await getDocs(teamDocQ);

        queries = mergeList(queries, teamSn.docs);
      }

      return queries.map(
        (doc): IQuery => ({
          ...doc.data(),
          id: doc.id,
          storageType: 'firestore',
        })
      );
    })
  );

  return queryCollections.map((col, idx) => {
    const queriesResult = collectionQueries[idx];
    return {
      ...col.data(),
      id: col.id,
      queries: queriesResult?.status === 'fulfilled' ? queriesResult.value : [],
      storageType: 'firestore',
    };
  });
};

const mergeList = <T extends { id: string }>(list1: T[], list2: T[]) => {
  const seenIds = new Set(list1.map(d => d.id));

  return [...list1, ...list2.filter(d => !seenIds.has(d.id))];
};
