import {
  CollectionState,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';

export const COLLECTION_PATH_SEPARATOR = '/';

export const getCollections = (state: CollectionState) => state.list || [];
export const getCollection = (
  collections: IQueryCollection[],
  collectionId: string
) => collections.find((collection) => collection.id === collectionId);

export const getParentCollectionId = (collection: IQueryCollection) => {
  const id = collection.parentPath?.split(COLLECTION_PATH_SEPARATOR)?.pop();
  return id ? id : undefined;
};

export const getParentCollection = (
  collections: IQueryCollection[],
  collection: IQueryCollection
) => {
  const parentCollectionId = getParentCollectionId(collection);
  if (parentCollectionId) {
    return getCollection(collections, parentCollectionId);
  }
};

export const getAllParentCollections = (
  collections: IQueryCollection[],
  collection: IQueryCollection
) => {
  const result: IQueryCollection[] = [];
  let curCollection = collection;
  for (;;) {
    const parentCollection = getParentCollection(collections, curCollection);
    if (!parentCollection) {
      return result.reverse();
    }

    result.push(parentCollection);
    curCollection = parentCollection;
  }
};

export const getWindowParentCollections = (
  window: PerWindowState,
  collections: IQueryCollection[]
) => {
  if (window?.layout.windowIdInCollection && window?.layout.collectionId) {
    const collection = getCollection(collections, window.layout.collectionId);
    if (collection) {
      return [...getAllParentCollections(collections, collection), collection];
    }
  }
  return [];
};
