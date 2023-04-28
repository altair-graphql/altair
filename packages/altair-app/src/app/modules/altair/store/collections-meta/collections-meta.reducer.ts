import { AllActions } from '../action';
import { CollectionsMetaState } from 'altair-graphql-core/build/types/state/collections-meta.interfaces';

import * as collectionsMetaActions from './collections-meta.action';

export const getInitialState = (): CollectionsMetaState => {
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
    case collectionsMetaActions.UPDATE_COLLECTIONS_SORT_BY:
      return { ...state, collectionsSortBy: action.payload.sortBy };
    case collectionsMetaActions.UPDATE_QUERIES_SORT_BY:
      return { ...state, queriesSortBy: action.payload.sortBy };
    default:
      return state;
  }
}
