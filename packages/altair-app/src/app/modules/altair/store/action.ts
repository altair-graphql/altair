import { Action as NGRXAction } from '@ngrx/store';

export interface ActionWithPayload extends NGRXAction {
  payload?: any;
}

export const INIT_WINDOW = '___INIT_WINDOW___';

export const APP_INIT_ACTION = 'APP_INIT_ACTION';
export class AppInitAction {
  readonly type = APP_INIT_ACTION;
  constructor(public payload: { initialState: any }) {}
}
