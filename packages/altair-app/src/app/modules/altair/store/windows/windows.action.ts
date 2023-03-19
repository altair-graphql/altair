import { Action as NGRXAction } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

export const ADD_WINDOW = 'ADD_WINDOW';
export const SET_WINDOWS = 'SET_WINDOWS';
export const REMOVE_WINDOW = 'REMOVE_WINDOW';

export const EXPORT_WINDOW = 'EXPORT_WINDOW';
export const IMPORT_WINDOW = 'IMPORT_WINDOW';
export const IMPORT_WINDOW_FROM_CURL = 'IMPORT_WINDOW_FROM_CURL';
export const REOPEN_CLOSED_WINDOW = 'REOPEN_CLOSED_WINDOW';
export const RELOAD_COLLECTION_WINDOWS = 'RELOAD_COLLECTION_WINDOWS';

interface AddWindowPayload {
  windowId: string;
  title: string;
  url: string;
  collectionId?: string;
  windowIdInCollection?: string;
  fixedTitle?: boolean;
}
export class AddWindowAction implements NGRXAction {
  readonly type = ADD_WINDOW;

  constructor(public payload: AddWindowPayload) {}
}
export class SetWindowsAction implements NGRXAction {
  readonly type = SET_WINDOWS;

  constructor(public payload: PerWindowState[]) {}
}

export class RemoveWindowAction implements NGRXAction {
  readonly type = REMOVE_WINDOW;

  constructor(public payload: { windowId: string }) {}
}

export class ExportWindowAction implements NGRXAction {
  readonly type = EXPORT_WINDOW;

  constructor(public payload: { windowId: string }) {}
}

export class ImportWindowAction implements NGRXAction {
  readonly type = IMPORT_WINDOW;
}

export class ImportWindowFromCurlAction implements NGRXAction {
  readonly type = IMPORT_WINDOW_FROM_CURL;

  constructor(public payload?: { data: string }) {}
}

export class ReopenClosedWindowAction implements NGRXAction {
  readonly type = REOPEN_CLOSED_WINDOW;
}

export class ReloadCollectionWindowsAction implements NGRXAction {
  readonly type = RELOAD_COLLECTION_WINDOWS;
}

export type Action =
  | AddWindowAction
  | SetWindowsAction
  | RemoveWindowAction
  | ExportWindowAction
  | ImportWindowAction
  | ImportWindowFromCurlAction
  | ReopenClosedWindowAction
  | ReloadCollectionWindowsAction;
