import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import * as queryActions from './query/query.action';
import * as localActions from './local/local.action';
import * as accountActions from './account/account.action';
import * as collectionActions from './collection/collection.action';
import * as collectionsMetaActions from './collections-meta/collections-meta.action';
import * as workspaceActions from './workspace/workspace.action';
import * as dbActions from './db/db.action';
import * as docsActions from './docs/docs.action';
import * as donationActions from './donation/donation.action';
import * as environmentsActions from './environments/environments.action';
import * as layoutActions from './layout/layout.action';
import * as headersActions from './headers/headers.action';
import * as dialogsActions from './dialogs/dialogs.action';
import * as historyActions from './history/history.action';
import * as preRequestActions from './pre-request/pre-request.action';
import * as postRequestActions from './post-request/post-request.action';
import * as streamActions from './stream/stream.action';
import * as settingsActions from './settings/settings.action';
import * as gqlSchemaActions from './gql-schema/gql-schema.action';
import * as variablesActions from './variables/variables.action';
import * as windowsActions from './windows/windows.action';
import * as windowsMetaActions from './windows-meta/windows-meta.action';
import * as authorizationActions from './authorization/authorization.action';
import { INIT } from '@ngrx/store';

export const INIT_WINDOW = '___INIT_WINDOW___';
export const APP_INIT_ACTION = 'APP_INIT_ACTION';

export class InitAction {
  readonly type = INIT;
}

export class InitWindowAction {
  readonly type = INIT_WINDOW;
}

export class AppInitAction {
  readonly type = APP_INIT_ACTION;
  constructor(public payload: { initialState: Partial<RootState> | undefined }) {}
}

export type AllActions =
  | InitAction
  | InitWindowAction
  | AppInitAction
  | queryActions.Action
  | localActions.Action
  | accountActions.Action
  | authorizationActions.Action
  | collectionActions.Action
  | collectionsMetaActions.Action
  | workspaceActions.Action
  | dbActions.Action
  | docsActions.Action
  | donationActions.Action
  | environmentsActions.Action
  | headersActions.Action
  | variablesActions.Action
  | dialogsActions.Action
  | gqlSchemaActions.Action
  | settingsActions.Action
  | historyActions.Action
  | preRequestActions.Action
  | postRequestActions.Action
  | streamActions.Action
  | layoutActions.Action
  | windowsActions.Action
  | windowsMetaActions.Action;
