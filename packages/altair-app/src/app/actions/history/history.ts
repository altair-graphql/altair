import { Action } from '@ngrx/store';

export const ADD_HISTORY = 'ADD_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';

export class AddHistoryAction implements Action {
  readonly type = ADD_HISTORY;

  constructor(public windowId: string, public payload: { query: string }) { }
}

export class ClearHistoryAction implements Action {
  readonly type = CLEAR_HISTORY;

  constructor(public windowId: string, public payload: {}) { }
}

export type Action = AddHistoryAction | ClearHistoryAction;
