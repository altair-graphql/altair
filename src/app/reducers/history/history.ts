import { Action } from '@ngrx/store';

import * as history from '../../actions/history/history';

import config from '../../config';

export interface History {
  query: string;
}

export interface HistoryList extends Array<History> {
  [index: number]: History;
}

export interface State {
  list: HistoryList;
}

export const initialState: State = {
  list: []
};

export function historyReducer(state = initialState, action: history.Action): State {
  switch (action.type) {
    case history.ADD_HISTORY:
      const _state = { ...state };

      // If the items in the list is more than the allowed limit, remove the last item
      if (state.list.length >= config.query_history_depth) {
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
    default:
      return state;
  }
}
