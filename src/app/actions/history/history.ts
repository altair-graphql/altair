import { Action } from '@ngrx/store';

export const ADD_HISTORY = 'ADD_HISTORY';

export class AddHistoryAction implements Action {
  readonly type = ADD_HISTORY;

  constructor(public windowId: string, public payload: { query: string }) { }
}

export type Action = AddHistoryAction;
