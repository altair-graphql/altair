import { Action as NGRXAction } from '@ngrx/store';

export const TOGGLE_HEADER_DIALOG = 'TOGGLE_HEADER_DIALOG';
export const TOGGLE_VARIABLE_DIALOG = 'TOGGLE_VARIABLE_DIALOG';
export const TOGGLE_SUBSCRIPTION_URL_DIALOG = 'TOGGLE_SUBSCRIPTION_URL_DIALOG';
export const TOGGLE_HISTORY_DIALOG = 'TOGGLE_HISTORY_DIALOG';
export const TOGGLE_PRE_REQUEST_DIALOG = 'TOGGLE_PRE_REQUEST_DIALOG';
export const TOGGLE_REQUEST_EXTENSIONS_DIALOG = 'TOGGLE_REQUEST_EXTENSIONS_DIALOG';

export class ToggleHeaderDialogAction implements NGRXAction {
  readonly type = TOGGLE_HEADER_DIALOG;

  constructor(public windowId: string) {}
}

export class ToggleVariableDialogAction implements NGRXAction {
  readonly type = TOGGLE_VARIABLE_DIALOG;

  constructor(public windowId: string) {}
}

export class ToggleSubscriptionUrlDialogAction implements NGRXAction {
  readonly type = TOGGLE_SUBSCRIPTION_URL_DIALOG;

  constructor(public windowId: string) {}
}

export class ToggleHistoryDialogAction implements NGRXAction {
  readonly type = TOGGLE_HISTORY_DIALOG;

  constructor(public windowId: string) {}
}

export class TogglePreRequestDialogAction implements NGRXAction {
  readonly type = TOGGLE_PRE_REQUEST_DIALOG;

  constructor(public windowId: string) {}
}

export class ToggleRequestExtensionsDialogAction implements NGRXAction {
  readonly type = TOGGLE_REQUEST_EXTENSIONS_DIALOG;

  constructor(
    public windowId: string,
    public payload: { value: boolean }
  ) {}
}

export type Action =
  | ToggleHeaderDialogAction
  | ToggleVariableDialogAction
  | ToggleSubscriptionUrlDialogAction
  | ToggleHistoryDialogAction
  | TogglePreRequestDialogAction
  | ToggleRequestExtensionsDialogAction;
