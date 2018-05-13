import { Action } from '@ngrx/store';

import * as windowsMeta from '../../actions/windows-meta/windows-meta';

export interface State {
  activeWindowId: string;
  windowIds: Array<string>;
  showImportCurlDialog: boolean;
}

const initialState: State = {
  activeWindowId: '',
  windowIds: [],
  showImportCurlDialog: false,
};

export function windowsMetaReducer(state = initialState, action: windowsMeta.Action): State {
  switch (action.type) {
    case windowsMeta.SET_ACTIVE_WINDOW_ID:
      return { ...state, activeWindowId: action.payload.windowId };
    case windowsMeta.SET_WINDOW_IDS:
      return { ...state, windowIds: action.payload.ids };
    case windowsMeta.REPOSITION_WINDOW:
      const curPos = action.payload.currentPosition;
      const newPos = action.payload.newPosition;

      if (curPos > -1 && curPos < state.windowIds.length && newPos > -1 && newPos < state.windowIds.length) {
        const arr = [ ...state.windowIds ];
        arr.splice(newPos, 0, arr.splice(curPos, 1)[0]);

        return { ...state, windowIds: [ ...arr ] };
      }
      return state;
    case windowsMeta.SHOW_IMPORT_CURL_DIALOG:
      return { ...state, showImportCurlDialog: action.payload.value };
    default:
      return state;
  }
}
