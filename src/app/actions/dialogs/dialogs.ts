import { Action } from '@ngrx/store';

export const TOGGLE_HEADER_DIALOG = 'TOGGLE_HEADER_DIALOG';
export const TOGGLE_VARIABLE_DIALOG = 'TOGGLE_VARIABLE_DIALOG';
export const TOGGLE_SUBSCRIPTION_URL_DIALOG = 'TOGGLE_SUBSCRIPTION_URL_DIALOG';
export const TOGGLE_HISTORY_DIALOG = 'TOGGLE_HISTORY_DIALOG';
export const TOGGLE_ADD_TO_COLLECTION_DIALOG = 'TOGGLE_ADD_TO_COLLECTION_DIALOG';
export const TOGGLE_PRE_REQUEST_DIALOG = 'TOGGLE_PRE_REQUEST_DIALOG';

export class ToggleHeaderDialogAction implements Action {
  readonly type = TOGGLE_HEADER_DIALOG;

  constructor(public windowId: string) {}
}

export class ToggleVariableDialogAction implements Action {
  readonly type = TOGGLE_VARIABLE_DIALOG;

  constructor(public windowId: string) { }
}

export class ToggleSubscriptionUrlDialogAction implements Action {
  readonly type = TOGGLE_SUBSCRIPTION_URL_DIALOG;

  constructor(public windowId: string) { }
}

export class ToggleHistoryDialogAction implements Action {
  readonly type = TOGGLE_HISTORY_DIALOG;

  constructor(public windowId: string) { }
}

export class ToggleAddToCollectionDialogAction implements Action {
  readonly type = TOGGLE_ADD_TO_COLLECTION_DIALOG;

  constructor(public windowId: string) { }
}

export class TogglePreRequestDialogAction implements Action {
  readonly type = TOGGLE_PRE_REQUEST_DIALOG;

  constructor(public windowId: string) { }
}

export type Action =
  | ToggleHeaderDialogAction
  | ToggleVariableDialogAction
  | ToggleSubscriptionUrlDialogAction
  | ToggleHistoryDialogAction
  | ToggleAddToCollectionDialogAction
  | TogglePreRequestDialogAction
  ;
