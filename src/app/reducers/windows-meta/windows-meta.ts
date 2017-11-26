import { Action } from '@ngrx/store';

import * as windowsMeta from '../../actions/windows-meta/windows-meta';

export interface State {
  activeWindowId: string;
}

const initialState: State = {
  activeWindowId: ''
};

export function windowsMetaReducer(state = initialState, action: windowsMeta.Action): State {
  switch (action.type) {
    case windowsMeta.SET_ACTIVE_WINDOW_ID:
      return Object.assign({}, state, { activeWindowId: action.payload.windowId });
    default:
      return state;
  }
}
