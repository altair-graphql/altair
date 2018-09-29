import { Action } from '@ngrx/store';

import * as collectionActions from '../actions/collection/collection';

export interface State {
  list: any[];
}

export const initialState: State = {
  list: []
};

export function collectionReducer(state = initialState, action: collectionActions.Action): State {
  switch (action.type) {
    case collectionActions.SET_COLLECTIONS:
      return { ...state, list: action.payload.collections };
    default:
      return state;
  }
}
