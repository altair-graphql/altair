import { Action as NGRXAction } from '@ngrx/store';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';

export const SET_SETTINGS_JSON = 'SET_SETTINGS_JSON';
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

export class SetSettingsJsonAction implements NGRXAction {
  readonly type = SET_SETTINGS_JSON;

  constructor(public payload: { value: string }) {}
}

export class UpdateSettingsAction implements NGRXAction {
  readonly type = UPDATE_SETTINGS;

  constructor(public payload: Partial<SettingsState>) {}
}

export type Action = SetSettingsJsonAction | UpdateSettingsAction;
