import { Action as NGRXAction } from '@ngrx/store';

export interface ActionWithPayload extends NGRXAction {
  payload?: any;
}

export const INIT_WINDOW = '___INIT_WINDOW___';
