import { Action } from '@ngrx/store';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { HistoryState } from 'altair-graphql-core/build/types/state/history.interfaces';

import * as history from './history.action';

export const getInitialState = (): HistoryState => {
  return {
    list: [],
  };
};

export function historyReducer(state = getInitialState(), action: history.Action): HistoryState {
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
