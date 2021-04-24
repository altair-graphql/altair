import * as fromLayout from './layout/layout.reducer';
import * as fromHeaders from './headers/headers.reducer';
import * as fromVariables from './variables/variables.reducer';
import * as fromDialogs from './dialogs/dialogs.reducer';
import * as fromGqlSchema from './gql-schema/gql-schema.reducer';
import * as fromDocs from './docs/docs.reducer';
import * as fromWindows from './windows/windows.reducer';
import * as fromHistory from './history/history.reducer';
import * as fromWindowsMeta from './windows-meta/windows-meta.reducer';
import * as fromDonation from './donation/donation.reducer';
import * as fromCollection from './collection/collection.reducer';
import * as fromStream from './stream/stream.reducer';
import * as fromPreRequest from './pre-request/pre-request.reducer';
import * as fromPostRequest from './post-request/post-request.reducer';
import * as fromLocal from './local/local.reducer';
import { GraphQLSchema } from 'graphql';
import { SettingsState } from './settings/settings.interfaces';
import { EnvironmentsState } from './environments/environments.interfaces';
import { QueryState } from './query/query.interfaces';

export interface PerWindowState {
  layout: fromLayout.State;
  query: QueryState;
  headers: fromHeaders.State;
  variables: fromVariables.State;
  dialogs: fromDialogs.State;
  schema: fromGqlSchema.State;
  docs: fromDocs.State;
  history: fromHistory.State;
  stream: fromStream.State;
  preRequest: fromPreRequest.State;
  postRequest: fromPostRequest.State;
  windowId: string; // Used by the window reducer
}

export interface RootState {
  windows: fromWindows.State;
  windowsMeta: fromWindowsMeta.State;
  settings: SettingsState;
  donation: fromDonation.State;
  collection: fromCollection.State;
  environments: EnvironmentsState;
  local: fromLocal.State;
}

/**
 * Data structure for exported windows
 */
 export interface ExportWindowState {
  version: 1;
  type: 'window';
  windowName: string;
  apiUrl: string;
  query: string;
  headers: Array<{key: string, value: string}>;
  variables: string;
  subscriptionUrl: string;
  subscriptionConnectionParams?: string;
  preRequestScript?: string;
  preRequestScriptEnabled?: boolean;
  postRequestScript?: string;
  postRequestScriptEnabled?: boolean;

  /**
   * ID of the collection this query belongs to
   */
  collectionId?: number;
  /**
   * ID for window in collection
   */
  windowIdInCollection?: string;
  gqlSchema?: GraphQLSchema;
}
