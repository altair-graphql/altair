import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import * as queryActions from './query/query.action';
import * as localActions from './local/local.action';
import * as accountActions from './account/account.action';
import * as collectionActions from './collection/collection.action';
import * as dbActions from './db/db.action';
import * as docsActions from './docs/docs.action';
import * as donationActions from './donation/donation.action';
import * as environmentsActions from './environments/environments.action';
import * as windowsActions from './windows/windows.action';
import { InitAction } from '@ngrx/store-devtools/src/reducer';

export const INIT_WINDOW = '___INIT_WINDOW___';

export const APP_INIT_ACTION = 'APP_INIT_ACTION';
export class AppInitAction {
  readonly type = APP_INIT_ACTION;
  constructor(
    public payload: { initialState: Partial<RootState> | undefined }
  ) {}
}

export type AllActions =
  | InitAction
  | AppInitAction
  | queryActions.Action
  | localActions.Action
  | accountActions.Action
  | collectionActions.Action
  | dbActions.Action
  | docsActions.Action
  | donationActions.Action
  | environmentsActions.Action
  | windowsActions.Action;
