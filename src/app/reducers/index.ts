import { combineReducers, Action, ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { compose } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../environments/environment';

import * as fromLayout from './layout/layout';
import * as fromQuery from './query/query';
import * as fromHeaders from './headers/headers';
import * as fromVariables from './variables/variables';
import * as fromDialogs from './dialogs/dialogs';
import * as fromGqlSchema from './gql-schema/gql-schema';
import * as fromDocs from './docs/docs';
import * as fromWindows from './windows';
import * as fromHistory from './history/history';
import * as fromWindowsMeta from './windows-meta/windows-meta';

export interface PerWindowState {
  layout: fromLayout.State;
  query: fromQuery.State;
  headers: fromHeaders.State;
  variables: fromVariables.State;
  dialogs: fromDialogs.State;
  schema: fromGqlSchema.State;
  docs: fromDocs.State;
  history: fromHistory.State;
  windowId: string; // Used by the window reducer
}

const perWindowReducers = {
  layout: fromLayout.layoutReducer,
  query: fromQuery.queryReducer,
  headers: fromHeaders.headerReducer,
  variables: fromVariables.variableReducer,
  dialogs: fromDialogs.dialogReducer,
  schema: fromGqlSchema.gqlSchemaReducer,
  docs: fromDocs.docsReducer,
  history: fromHistory.historyReducer
};

export interface State {
  windows: fromWindows.State;
  windowsMeta: fromWindowsMeta.State;
}

// Meta reducer to log actions
export const log = (_reducer) => (state: State, action: Action) => {
  if (!environment.production) {
    console.log(action.type, action);
  }
  return _reducer(state, action);
};

export const keySerializer = (key) => 'altair_' + key;

export const metaReducers: MetaReducer<any>[] = [
  localStorageSync({ keys: ['windows', 'windowsMeta'], rehydrate: true, storageKeySerializer: keySerializer }),
  // !environment.production ? storeFreeze : null,
  log
];

export const reducer: ActionReducerMap<State> = {
  windows: fromWindows.windows(combineReducers(perWindowReducers)),
  windowsMeta: fromWindowsMeta.windowsMetaReducer
};

export const selectWindowState = (windowId: string) => (state: State) => state.windows[windowId];

export * from './query/selectors';
export * from './docs/selectors';
export * from './headers/selectors';
