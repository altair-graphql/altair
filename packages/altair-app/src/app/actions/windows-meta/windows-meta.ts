import { Action as NGRXAction } from '@ngrx/store';

export const SET_ACTIVE_WINDOW_ID = 'SET_ACTIVE_WINDOW_ID';
export const SET_WINDOW_IDS = 'SET_WINDOW_IDS';
export const REPOSITION_WINDOW = 'REPOSITION_WINDOW';

export const SHOW_IMPORT_CURL_DIALOG = 'SHOW_IMPORT_CURL_DIALOG';
export const SHOW_EDIT_COLLECTION_DIALOG = 'SHOW_EDIT_COLLECTION_DIALOG';
export const SHOW_SETTINGS_DIALOG = 'SHOW_SETTINGS_DIALOG';
export const SHOW_ENVIRONMENT_MANAGER = 'SHOW_ENVIRONMENT_MANAGER';
export const SHOW_PLUGIN_MANAGER = 'SHOW_PLUGIN_MANAGER';

export class SetActiveWindowIdAction implements NGRXAction {
  readonly type = SET_ACTIVE_WINDOW_ID;

  constructor(public payload: { windowId: string }) {}
}

export class SetWindowIdsAction implements NGRXAction {
  readonly type = SET_WINDOW_IDS;

  constructor(public payload: { ids: string[]}) {}
}

export class RepositionWindowAction implements NGRXAction {
  readonly type = REPOSITION_WINDOW;

  constructor(public payload: { currentPosition: number, newPosition: number }) { }
}

export class ShowImportCurlDialogAction implements NGRXAction {
  readonly type = SHOW_IMPORT_CURL_DIALOG;

  constructor(public payload?: { value: boolean }) { }
}

export class ShowEditCollectionDialogAction implements NGRXAction {
  readonly type = SHOW_EDIT_COLLECTION_DIALOG;

  constructor(public payload?: { value: boolean }) { }
}

export class ShowSettingsDialogAction implements NGRXAction {
  readonly type = SHOW_SETTINGS_DIALOG;

  constructor(public payload?: { value: boolean }) { }
}

export class ShowEnvironmentManagerAction implements NGRXAction {
  readonly type = SHOW_ENVIRONMENT_MANAGER;

  constructor(public payload?: { value: boolean }) { }
}

export class ShowPluginManagerAction implements NGRXAction {
  readonly type = SHOW_PLUGIN_MANAGER;

  constructor(public payload?: { value: boolean }) { }
}

export type Action =
  | SetActiveWindowIdAction
  | SetWindowIdsAction
  | RepositionWindowAction
  | ShowImportCurlDialogAction
  | ShowEditCollectionDialogAction
  | ShowSettingsDialogAction
  | ShowEnvironmentManagerAction
  | ShowPluginManagerAction
  ;
