import { Action } from '@ngrx/store';

import * as collectionActions from '../actions/collection/collection';

export interface State {
  list: any[];
  activeCollection: any;
}

export const initialState: State = {
  list: [],
  activeCollection: null
};

export function collectionReducer(state = initialState, action: collectionActions.Action): State {
  switch (action.type) {
    case collectionActions.SET_COLLECTIONS:
      return { ...state, list: action.payload.collections };
    case collectionActions.SET_ACTIVE_COLLECTION:
      return { ...state, activeCollection: action.payload.collection };
    default:
      return state;
  }
}
