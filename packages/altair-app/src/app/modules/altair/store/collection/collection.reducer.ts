import { Action } from '@ngrx/store';
import { CollectionState } from 'altair-graphql-core/build/types/state/collection.interfaces';

import * as collectionActions from '../../store/collection/collection.action';

export const getInitialState = (): CollectionState => {
  return {
    list: [],
    activeCollection: null,
    sortBy: 'newest',
  };
};

export function collectionReducer(state = getInitialState(), action: collectionActions.Action): CollectionState {
  switch (action.type) {
    case collectionActions.SET_COLLECTIONS:
      return { ...state, list: action.payload.collections };
    case collectionActions.SET_ACTIVE_COLLECTION:
      return { ...state, activeCollection: action.payload.collection };
    case collectionActions.SORT_COLLECTIONS:
      return { ...state, sortBy: action.payload.sortBy };
    default:
      return state;
  }
}
