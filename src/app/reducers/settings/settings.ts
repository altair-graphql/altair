import { Action } from '@ngrx/store';

import * as settings from '../../actions/settings/settings';
import config from '../../config';

export interface State {
  isShown: boolean;
  theme: string;
  language: string;
  addQueryDepthLimit: number;
}

const initialState: State = {
  isShown: false,
  theme: 'light',
  language: 'en',
  addQueryDepthLimit: config.add_query_depth_limit
};

export function settingsReducer(state = initialState, action: settings.Action): State {
  switch (action.type) {
    case settings.SHOW_SETTINGS:
      return { ...state, isShown: true };
    case settings.HIDE_SETTINGS:
      return { ...state, isShown: false };
    case settings.SET_THEME:
      return { ...state, theme: action.payload.value };
    case settings.SET_LANGUAGE:
      return { ...state, language: action.payload.value };
    case settings.SET_ADD_QUERY_DEPTH_LIMIT:
      return { ...state, addQueryDepthLimit: action.payload.value };
    default:
      return state;
  }
}
