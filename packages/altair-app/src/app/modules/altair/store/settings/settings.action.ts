import { Action as NGRXAction } from '@ngrx/store';

export const SET_SETTINGS_JSON = 'SET_SETTINGS_JSON';

export class SetSettingsJsonAction implements NGRXAction {
  readonly type = SET_SETTINGS_JSON;

  constructor(public payload: { value: string }) { }
}

export type Action =
  | SetSettingsJsonAction;
