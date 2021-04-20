import { Action as NGRXAction } from '@ngrx/store';

export const SET_POSTREQUEST_SCRIPT = 'SET_POSTREQUEST_SCRIPT';
export const SET_POSTREQUEST_ENABLED = 'SET_POSTREQUEST_ENABLED';

export class SetPostRequestScriptAction implements NGRXAction {
  readonly type = SET_POSTREQUEST_SCRIPT;

  constructor(public windowId: string, public payload: { script: string }) { }
}

export class SetPostRequestEnabledAction implements NGRXAction {
  readonly type = SET_POSTREQUEST_ENABLED;

  constructor(public windowId: string, public payload: { enabled: boolean }) { }
}

export type Action =
  | SetPostRequestScriptAction
  | SetPostRequestEnabledAction
  ;
