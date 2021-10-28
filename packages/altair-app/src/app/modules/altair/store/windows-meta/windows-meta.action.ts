import { Action as NGRXAction } from '@ngrx/store';

export const SET_ACTIVE_WINDOW_ID = 'SET_ACTIVE_WINDOW_ID';
export const SET_NEXT_WINDOW_ACTIVE = 'SET_NEXT_WINDOW_ACTIVE';
export const SET_PREVIOUS_WINDOW_ACTIVE = 'SET_PREVIOUS_WINDOW_ACTIVE';
export const SET_WINDOW_IDS = 'SET_WINDOW_IDS';
export const REPOSITION_WINDOW = 'REPOSITION_WINDOW';

export const SHOW_IMPORT_CURL_DIALOG = 'SHOW_IMPORT_CURL_DIALOG';
export const SHOW_EDIT_COLLECTION_DIALOG = 'SHOW_EDIT_COLLECTION_DIALOG';
export const SHOW_SETTINGS_DIALOG = 'SHOW_SETTINGS_DIALOG';
export const SHOW_ENVIRONMENT_MANAGER = 'SHOW_ENVIRONMENT_MANAGER';
export const SHOW_PLUGIN_MANAGER = 'SHOW_PLUGIN_MANAGER';

export const EXPORT_BACKUP_DATA = 'EXPORT_BACKUP_DATA';
export const IMPORT_BACKUP_DATA = 'IMPORT_BACKUP_DATA';

export class SetActiveWindowIdAction implements NGRXAction {
  readonly type = SET_ACTIVE_WINDOW_ID;

  constructor(public payload: { windowId: string }) {}
}

export class SetNextWindowActiveAction implements NGRXAction {
  readonly type = SET_NEXT_WINDOW_ACTIVE;

  constructor(public payload?: any) {}
}

export class SetPreviousWindowAction implements NGRXAction {
  readonly type = SET_PREVIOUS_WINDOW_ACTIVE;

  constructor(public payload?: any) {}
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

export class ExportBackupDataAction implements NGRXAction {
  readonly type = EXPORT_BACKUP_DATA;

  constructor(public payload?: any) {}
}

export class ImportBackupDataAction implements NGRXAction {
  readonly type = IMPORT_BACKUP_DATA;

  constructor(public payload?: any) {}
}

export type Action =
  | SetActiveWindowIdAction
  | SetNextWindowActiveAction
  | SetPreviousWindowAction
  | SetWindowIdsAction
  | RepositionWindowAction
  | ShowImportCurlDialogAction
  | ShowEditCollectionDialogAction
  | ShowSettingsDialogAction
  | ShowEnvironmentManagerAction
  | ShowPluginManagerAction
  | ExportBackupDataAction
  | ImportBackupDataAction
  ;
