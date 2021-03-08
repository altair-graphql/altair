import { Action as NGRXAction } from '@ngrx/store';

export const SET_PREREQUEST_SCRIPT = 'SET_PREREQUEST_SCRIPT';
export const SET_PREREQUEST_ENABLED = 'SET_PREREQUEST_ENABLED';

export class SetPreRequestScriptAction implements NGRXAction {
  readonly type = SET_PREREQUEST_SCRIPT;

  constructor(public windowId: string, public payload: { script: string }) { }
}

export class SetPreRequestEnabledAction implements NGRXAction {
  readonly type = SET_PREREQUEST_ENABLED;

  constructor(public windowId: string, public payload: { enabled: boolean }) { }
}

export type Action =
  | SetPreRequestScriptAction
  | SetPreRequestEnabledAction
  ;
