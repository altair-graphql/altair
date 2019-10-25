// This would contain arbitrary data that should be stored in memory and not persisted

import * as local from '../../actions/local/local';

export interface State {
  closedWindows: any[];
}

const initialState: State = {
  closedWindows: [],
};

export function localReducer(state = initialState, action: local.Action): State {
  switch (action.type) {
    case local.PUSH_CLOSED_WINDOW_TO_LOCAL:
      return {
        ...state,
        closedWindows: [ ...state.closedWindows, action.payload.window ],
      };
    case local.POP_FROM_CLOSED_WINDOWS:
      const len = state.closedWindows.length;
      return {
        ...state,
        closedWindows: state.closedWindows.filter((_, i) => i < len - 1),
      }
    default:
      return state;
  }
}
