import { Action as NGRXAction } from '@ngrx/store';

export const ADD_HISTORY = 'ADD_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';
export const TRY_ADD_HISTORY = 'TRY_ADD_HISTORY';

export class AddHistoryAction implements NGRXAction {
  readonly type = ADD_HISTORY;

  constructor(
    public windowId: string,
    public payload: { query: string; limit?: number }
  ) {}
}

export class ClearHistoryAction implements NGRXAction {
  readonly type = CLEAR_HISTORY;

  constructor(public windowId: string) {}
}

export class TryAddHistoryAction implements NGRXAction {
  readonly type = TRY_ADD_HISTORY;

  constructor(public payload: { windowId: string; query: string; limit?: number }) {}
}

export type Action = AddHistoryAction | ClearHistoryAction | TryAddHistoryAction;
