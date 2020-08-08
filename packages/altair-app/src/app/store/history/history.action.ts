import { Action as NGRXAction } from '@ngrx/store';

export const ADD_HISTORY = 'ADD_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';

export class AddHistoryAction implements NGRXAction {
  readonly type = ADD_HISTORY;

  constructor(public windowId: string, public payload: { query: string, limit?: number }) { }
}

export class ClearHistoryAction implements NGRXAction {
  readonly type = CLEAR_HISTORY;

  constructor(public windowId: string, public payload: {}) { }
}

export type Action = AddHistoryAction | ClearHistoryAction;
