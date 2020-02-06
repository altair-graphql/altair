import { Action as NGRXAction } from '@ngrx/store';
import { SettingsTheme, SettingsLanguage } from 'app/reducers/settings/settings';

export const SET_THEME = 'SET_THEME';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const SET_ADD_QUERY_DEPTH_LIMIT = 'SET_ADD_QUERY_DEPTH_LIMIT';
export const SET_TAB_SIZE_ACTION = 'SET_TAB_SIZE_ACTION';

export const SET_SETTINGS_JSON = 'SET_SETTINGS_JSON';

export class SetThemeAction implements NGRXAction {
  readonly type = SET_THEME;

  constructor(public payload: { value: SettingsTheme }) {}
}

export class SetLanguageAction implements NGRXAction {
  readonly type = SET_LANGUAGE;

  constructor(public payload: { value: SettingsLanguage }) { }
}

export class SetAddQueryDepthLimitAction implements NGRXAction {
  readonly type = SET_ADD_QUERY_DEPTH_LIMIT;

  constructor(public payload: { value: number }) { }
}

export class SetTabSizeAction implements NGRXAction {
  readonly type = SET_TAB_SIZE_ACTION;

  constructor(public payload: { value: number }) { }
}

export class SetSettingsJsonAction implements NGRXAction {
  readonly type = SET_SETTINGS_JSON;

  constructor(public payload: { value: string }) { }
}

export type Action =
  | SetThemeAction
  | SetLanguageAction
  | SetAddQueryDepthLimitAction
  | SetTabSizeAction
  | SetSettingsJsonAction;
