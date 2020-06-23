import { Action } from '@ngrx/store';

import * as history from './history.action';

import { getAltairConfig } from '../../config';

export interface History {
  query: string;
}

export interface State {
  list: History[];
}

export const getInitialState = (): State => {
  return {
    list: [],
  };
};

export function historyReducer(state = getInitialState(), action: history.Action): State {
  switch (action.type) {
    case history.ADD_HISTORY:
      const _state = { ...state };
      const limit = (typeof action.payload.limit !== 'undefined' ? action.payload.limit : getAltairConfig().query_history_depth);

      // If the items in the list is more than the allowed limit, remove the last item
      if (state.list.length >= limit) {
        // Remove the last item in the list
        _state.list.pop();
      }

      return {
        ..._state,
        list: [
          { query: action.payload.query }, // Add the new item to the top of the list
          ..._state.list
        ]
      };
    case history.CLEAR_HISTORY:
      return {list: []};
    default:
      return state;
  }
}
