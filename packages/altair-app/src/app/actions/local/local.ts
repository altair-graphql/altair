import { Action as NGRXAction } from '@ngrx/store';

export const PUSH_CLOSED_WINDOW_TO_LOCAL = 'PUSH_CLOSED_WINDOW_TO_LOCAL';
export const POP_FROM_CLOSED_WINDOWS = 'POP_FROM_CLOSED_WINDOWS';

export class PushClosedWindowToLocalAction implements NGRXAction {
  readonly type = PUSH_CLOSED_WINDOW_TO_LOCAL;

  constructor(public payload: { window: any }) {}
}

export class PopFromClosedWindowsAction implements NGRXAction {
  readonly type = POP_FROM_CLOSED_WINDOWS;
}

export type Action =
  | PushClosedWindowToLocalAction
  | PopFromClosedWindowsAction
  ;
