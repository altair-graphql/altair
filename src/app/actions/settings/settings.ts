import { Action } from '@ngrx/store';

export const SHOW_SETTINGS = 'SHOW_SETTINGS';
export const HIDE_SETTINGS = 'HIDE_SETTINGS';

export const SET_THEME = 'SET_THEME';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_ADD_QUERY_DEPTH_LIMIT = 'SET_ADD_QUERY_DEPTH_LIMIT';

export class ShowSettingsAction implements Action {
  readonly type = SHOW_SETTINGS;
}

export class HideSettingsAction implements Action {
  readonly type = HIDE_SETTINGS;
}

export class SetThemeAction implements Action {
  readonly type = SET_THEME;

  constructor(public payload: { value: string }) {}
}

export class SetLanguageAction implements Action {
  readonly type = SET_LANGUAGE;

  constructor(public payload: { value: string }) { }
}

export class SetAddQueryDepthLimitAction implements Action {
  readonly type = SET_ADD_QUERY_DEPTH_LIMIT;

  constructor(public payload: { value: number }) { }
}

export type Action =
  | ShowSettingsAction
  | HideSettingsAction
  | SetThemeAction
  | SetLanguageAction
  | SetAddQueryDepthLimitAction;
