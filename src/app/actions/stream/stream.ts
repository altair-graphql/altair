import { Action } from '@ngrx/store';

export const SET_STREAM_SETTING = 'SET_STREAM_SETTING';
export const SET_STREAM_CLIENT = 'SET_STREAM_CLIENT';
export const START_STREAM_CLIENT = 'START_STREAM_CLIENT';
export const STOP_STREAM_CLIENT = 'STOP_STREAM_CLIENT';
export const SET_STREAM_FAILED = 'SET_STREAM_FAILED';
export const SET_STREAM_CONNECTED = 'SET_STREAM_CONNECTED';

export class SetStreamSettingAction implements Action {
  readonly type = SET_STREAM_SETTING;

  constructor(public windowId: string, public payload: { streamUrl: string }) { }
}

export class SetStreamClientAction implements Action {
  readonly type = SET_STREAM_CLIENT;

  constructor(public windowId: string, public payload: { streamClient: any }) { }
}

export class StartStreamClientAction implements Action {
  readonly type = START_STREAM_CLIENT;

  constructor(public windowId: string, public payload = { backoff: 200 }) { }
}

export class StopStreamClientAction implements Action {
  readonly type = STOP_STREAM_CLIENT;

  constructor(public windowId: string, public payload?) { }
}

export class SetStreamFailedAction implements Action {
  readonly type = SET_STREAM_FAILED;

  constructor(public windowId: string, public payload: { failed: any }) { }
}

export class SetStreamConnectedAction implements Action {
  readonly type = SET_STREAM_CONNECTED;

  constructor(public windowId: string, public payload: { connected: boolean }) { }
}

export type Action =
  | SetStreamSettingAction
  | SetStreamClientAction
  | StartStreamClientAction
  | StopStreamClientAction
  | SetStreamFailedAction
  | SetStreamConnectedAction
  ;
