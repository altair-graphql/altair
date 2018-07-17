import { Action } from '@ngrx/store';

import * as fromWindows from '../../reducers/windows';

export const ADD_WINDOW = 'ADD_WINDOW';
export const SET_WINDOWS = 'SET_WINDOWS';
export const REMOVE_WINDOW = 'REMOVE_WINDOW';

export const EXPORT_WINDOW = 'EXPORT_WINDOW';
export const IMPORT_WINDOW = 'IMPORT_WINDOW';
export const IMPORT_WINDOW_FROM_CURL = 'IMPORT_WINDOW_FROM_CURL';

export class AddWindowAction implements Action {
  readonly type = ADD_WINDOW;

  constructor(public payload: any) {}
}
export class SetWindowsAction implements Action {
  readonly type = SET_WINDOWS;

  constructor(public payload: Array<any>) {}
}

export class RemoveWindowAction implements Action {
  readonly type = REMOVE_WINDOW;

  constructor(public payload: any) {}
}

export class ExportWindowAction implements Action {
  readonly type = EXPORT_WINDOW;

  constructor(public payload: { windowId: string }) { }
}

export class ImportWindowAction implements Action {
  readonly type = IMPORT_WINDOW;

  constructor(public payload?: any) { }
}

export class ImportWindowFromCurlAction implements Action {
  readonly type = IMPORT_WINDOW_FROM_CURL;

  constructor(public payload?: { data: string }) { }
}

export type Action =
  | AddWindowAction
  | SetWindowsAction
  | RemoveWindowAction
  | ExportWindowAction
  | ImportWindowAction
  | ImportWindowFromCurlAction;
