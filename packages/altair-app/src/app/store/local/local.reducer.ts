// This would contain arbitrary data that should be stored in memory and not persisted

import * as local from './local.action';

const MAX_CLOSED_WINDOWS_LENGTH = 50;

export interface State {
  closedWindows: any[];
}

export const getInitialState = (): State => {
  return {
    closedWindows: [],
  };
};

export function localReducer(state = getInitialState(), action: local.Action): State {
  const len = state.closedWindows.length;
  switch (action.type) {
    case local.PUSH_CLOSED_WINDOW_TO_LOCAL:
      return {
        ...state,
        closedWindows: len === MAX_CLOSED_WINDOWS_LENGTH ?
          [ ...state.closedWindows.slice(1), action.payload.window ] :
          [ ...state.closedWindows, action.payload.window ],

      };
    case local.POP_FROM_CLOSED_WINDOWS:
      return {
        ...state,
        closedWindows: state.closedWindows.filter((_, i) => i < len - 1),
      }
    default:
      return state;
  }
}
