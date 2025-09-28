import { AllActions } from '../action';
import { CollectionsMetaState } from 'altair-graphql-core/build/types/state/collections-meta.interfaces';

import * as collectionsMetaActions from './collections-meta.action';

export const getInitialState = (): CollectionsMetaState => {
  // Try to restore saved sorting preferences from backup storage
  try {
    const storageKey = 'altair_collectionsMeta_backup';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as CollectionsMetaState;
      // Validate that the parsed data has the expected structure
      if (parsed && typeof parsed.collectionsSortBy === 'string' && typeof parsed.queriesSortBy === 'string') {
        return parsed;
      }
    }
  } catch (error) {
    // Ignore parsing errors and fall back to defaults
  }

  return {
    collectionsSortBy: 'newest',
    queriesSortBy: 'newest',
  };
};

export function collectionsMetaReducer(
  state = getInitialState(),
  action: AllActions
): CollectionsMetaState {
  switch (action.type) {
    case collectionsMetaActions.UPDATE_COLLECTIONS_SORT_BY: {
      const newState = { ...state, collectionsSortBy: action.payload.sortBy };
      // Explicit backup to ensure sorting preferences are preserved
      try {
        const storageKey = 'altair_collectionsMeta_backup';
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        // Ignore storage errors
      }
      return newState;
    }
    case collectionsMetaActions.UPDATE_QUERIES_SORT_BY: {
      const newState = { ...state, queriesSortBy: action.payload.sortBy };
      // Explicit backup to ensure sorting preferences are preserved
      try {
        const storageKey = 'altair_collectionsMeta_backup';
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        // Ignore storage errors
      }
      return newState;
    }
    default:
      return state;
  }
}
