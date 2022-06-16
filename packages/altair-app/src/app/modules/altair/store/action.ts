import { Action as NGRXAction } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export interface ActionWithPayload extends NGRXAction {
  payload?: any;
}

export const INIT_WINDOW = '___INIT_WINDOW___';

export const APP_INIT_ACTION = 'APP_INIT_ACTION';
export class AppInitAction {
  readonly type = APP_INIT_ACTION;
  constructor(
    public payload: { initialState: Partial<RootState> | undefined }
  ) {}
}
