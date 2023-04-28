import { Action } from '@ngrx/store';
import { CollectionState } from 'altair-graphql-core/build/types/state/collection.interfaces';

import * as collectionActions from '../../store/collection/collection.action';
import { AllActions } from '../action';

export const getInitialState = (): CollectionState => {
  return {
    list: [],
  };
};

export function collectionReducer(
  state = getInitialState(),
  action: AllActions
): CollectionState {
  switch (action.type) {
    case collectionActions.SET_COLLECTIONS:
      return { ...state, list: action.payload.collections };
    case collectionActions.SET_ACTIVE_COLLECTION:
      return { ...state, activeCollection: action.payload.collection };
    default:
      return state;
  }
}
