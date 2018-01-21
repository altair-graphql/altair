import { Action } from '@ngrx/store';

export const SET_ACTIVE_WINDOW_ID = 'SET_ACTIVE_WINDOW_ID';
export const SET_WINDOW_IDS = 'SET_WINDOW_IDS';
export const REPOSITION_WINDOW = 'REPOSITION_WINDOW';

export class SetActiveWindowIdAction implements Action {
  readonly type = SET_ACTIVE_WINDOW_ID;

  constructor(public payload: { windowId: string }) {}
}

export class SetWindowIdsAction implements Action {
  readonly type = SET_WINDOW_IDS;

  constructor(public payload: { ids: string[]}) {}
}

export class RepositionWindowAction implements Action {
  readonly type = REPOSITION_WINDOW;

  constructor(public payload: { currentPosition: number, newPosition: number }) { }
}

export type Action = SetActiveWindowIdAction | SetWindowIdsAction | RepositionWindowAction;
