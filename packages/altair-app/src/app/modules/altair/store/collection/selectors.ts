import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import {
  getAllParentCollections,
  getCollection,
  getCollections,
  getWindowCollection,
  getWindowParentCollections,
} from './utils';
import { selectActiveWindowState, selectWindowState } from '../windows/selectors';

export const selectCollectionState = (state: RootState) => state.collection;
export const selectCollections = createSelector(
  selectCollectionState,
  (collectionState) => getCollections(collectionState)
);
export const selectCollection = (collectionId: string) =>
  createSelector(selectCollections, (collections) =>
    getCollection(collections, collectionId)
  );

export const selectAllParentCollections = (collectionId: string) =>
  createSelector(selectCollections, (collections) => {
    const collection = getCollection(collections, collectionId);
    if (collection) {
      return getAllParentCollections(collections, collection);
    }
    return [];
  });

export const selectWindowCollection = (windowId?: string) =>
  createSelector(
    selectWindowState(windowId ?? ''),
    selectActiveWindowState,
    selectCollections,
    (window, activeWindow, collections) => {
      const w = window ?? activeWindow;
      if (w) {
        return getWindowCollection(w, collections);
      }
    }
  );

export const selectWindowParentCollections = (windowId?: string) =>
  createSelector(
    selectWindowState(windowId ?? ''),
    selectActiveWindowState,
    selectCollections,
    (window, activeWindow, collections) => {
      const w = window ?? activeWindow;
      if (w) {
        return getWindowParentCollections(w, collections);
      }
      return [];
    }
  );
