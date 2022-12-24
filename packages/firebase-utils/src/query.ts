import {
  deleteDoc,
  doc,
  WriteBatch,
  writeBatch,
  query,
  where,
  getDoc,
  getDocs,
  documentId
} from "firebase/firestore";
import {
  IQuery,
  IQueryCollection,
  IRemoteQuery,
  IRemoteQueryCollection
} from "altair-graphql-core/build/types/state/collection.interfaces";
import {
  FirebaseUtilsContext,
  now,
  queriesRef,
  queryCollectionsRef,
  updateDocument
} from "./utils";

export const createQueryCollection = async (
  ctx: FirebaseUtilsContext,
  queryCollection: IQueryCollection,
  parentCollectionId?: string
) => {
  // TODO: Team collection

  const batch = writeBatch(ctx.db);
  const newCollectionRef = doc(queryCollectionsRef(ctx.db));
  batch.set(newCollectionRef, {
    title: queryCollection.title,
    parentCollectionId: parentCollectionId,
    ownerUid: ctx.user.uid,
    id: newCollectionRef.id,
    created_at: now(),
    updated_at: now()
  });

  const { queryIds } = createQueriesToBatch(
    ctx,
    newCollectionRef.id,
    queryCollection.queries,
    batch
  );

  await batch.commit();

  return {
    collectionId: newCollectionRef.id,
    queryIds
  };
};

const createQueriesToBatch = (
  ctx: FirebaseUtilsContext,
  collectionServerId: string,
  queries: IQuery[],
  batch?: WriteBatch
) => {
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
      ownerUid: ctx.user.uid,
      created_at: now(),
      updated_at: now()
    });

    queryRes.push(newQueryRef.id);
  }

  return { batch, queryIds: queryRes };
};

export const createQueries = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string,
  queries: IQuery[]
) => {
  const { queryIds, batch } = createQueriesToBatch(
    ctx,
    collectionServerId,
    queries
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
  const snapshot = await getDoc(doc(queriesRef(ctx.db), queryServerId));
  return {
    id: snapshot.id,
    ...snapshot.data()
  };
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
      parentCollectionId: parentCollectionServerId
    }
  );
};

export const deleteCollection = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string
) => {
  await deleteDoc(doc(queryCollectionsRef(ctx.db), collectionServerId));
};

export const getCollection = async (
  ctx: FirebaseUtilsContext,
  collectionServerId: string
): Promise<IQueryCollection | undefined> => {
  const q = query(
    queryCollectionsRef(ctx.db),
    where("ownerUid", "==", ctx.user.uid),
    where(documentId(), "==", collectionServerId)
  );
  const querySnapshot = await getDocs(q);

  const queryCollectionSnapshot = querySnapshot.docs[0];

  if (!queryCollectionSnapshot) {
    return;
  }

  const docQ = query(
    queriesRef(ctx.db),
    where("ownerUid", "==", ctx.user.uid),
    where("collectionId", "==", queryCollectionSnapshot.id)
  );

  const sn = await getDocs(docQ);
  const queries = sn.docs.map(_ => ({ ..._.data(), id: _.id }));

  return {
    id: queryCollectionSnapshot.id,
    ...queryCollectionSnapshot.data(),
    queries,
    storageType: "firestore"
  };
};

// TODO: Handle team collections
export const getCollections = async (
  ctx: FirebaseUtilsContext
): Promise<IQueryCollection[]> => {
  // Get query collections where owner == uid
  // Get queries where collectionId in collection IDs
  const q = query(
    queryCollectionsRef(ctx.db),
    where("ownerUid", "==", ctx.user.uid)
  );
  const querySnapshot = await getDocs(q);

  const queryCollections = querySnapshot.docs;

  const collectionQueries = await Promise.allSettled(
    queryCollections.map(async col => {
      const docQ = query(
        queriesRef(ctx.db),
        where("ownerUid", "==", ctx.user.uid),
        where("collectionId", "==", col.id)
      );

      const sn = await getDocs(docQ);
      return sn.docs.map(
        (doc): IQuery => ({
          ...doc.data(),
          id: doc.id,
          storageType: "firestore"
        })
      );
    })
  );

  return queryCollections.map((col, idx) => {
    const queriesResult = collectionQueries[idx];
    return {
      id: col.id,
      ...col.data(),
      queries: queriesResult.status === "fulfilled" ? queriesResult.value : [],
      storageType: "firestore"
    };
  });
};
