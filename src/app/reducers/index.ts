import { InjectionToken } from '@angular/core';
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
import * as fromSettings from './settings/settings';
import * as fromDonation from './donation';
import * as fromCollection from './collection/collection';
import * as fromEnvironments from './environments';
import * as fromStream from './stream/stream';
import * as fromPreRequest from './pre-request/pre-request';
import { debug } from 'app/utils/logger';
import performantLocalStorage from 'app/utils/performant-local-storage';

export interface PerWindowState {
  layout: fromLayout.State;
  query: fromQuery.State;
  headers: fromHeaders.State;
  variables: fromVariables.State;
  dialogs: fromDialogs.State;
  schema: fromGqlSchema.State;
  docs: fromDocs.State;
  history: fromHistory.State;
  stream: fromStream.State;
  preRequest: fromPreRequest.State;
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
  history: fromHistory.historyReducer,
  stream: fromStream.streamReducer,
  preRequest: fromPreRequest.preRequestReducer,
};

export interface State {
  windows: fromWindows.State;
  windowsMeta: fromWindowsMeta.State;
  settings: fromSettings.State;
  donation: fromDonation.State;
  collection: fromCollection.State;
  environments: fromEnvironments.State;
}

// Meta reducer to log actions
export function log(_reducer: ActionReducer<any>): ActionReducer<any> {
  return (state: State, action: Action) => {
    if (!environment.production || window['__ENABLE_DEBUG_MODE__']) {
      debug.log(action.type, action);
    }
    window['__LAST_ACTION__'] = window['__LAST_ACTION__'] || [];
    window['__LAST_ACTION__'].push(action.type);
    if (environment.production && window['__LAST_ACTION__'].length > 10) {
      window['__LAST_ACTION__'].shift();
    }

    return _reducer(state, action);
  };
}

const altairInstanceStorageNamespace = window['__ALTAIR_INSTANCE_STORAGE_NAMESPACE__'] || 'altair_';
export const keySerializer = (key) => `${altairInstanceStorageNamespace}${key}`;

export function localStorageSyncReducer(_reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: ['windows', 'windowsMeta', 'settings', 'environments'],
    rehydrate: true,
    storage: performantLocalStorage,
    // syncCondition: (state) => console.log(state),
    storageKeySerializer: keySerializer
  })(_reducer);
}

export const metaReducers: MetaReducer<any>[] = [
  localStorageSyncReducer,
  // !environment.production ? storeFreeze : null,
  log
];

export const reducer: ActionReducerMap<State> = {
  windows: fromWindows.windows(combineReducers(perWindowReducers)),
  windowsMeta: fromWindowsMeta.windowsMetaReducer,
  settings: fromSettings.settingsReducer,
  donation: fromDonation.donationReducer,
  collection: fromCollection.collectionReducer,
  environments: fromEnvironments.environmentsReducer,
};

export const reducerToken = new InjectionToken<ActionReducerMap<State>>('Registered Reducers');

export const reducerProvider = [
  { provide: reducerToken, useValue: reducer }
];

export const selectWindowState = (windowId: string) => (state: State) => state.windows[windowId];

export * from './query/selectors';
export * from './docs/selectors';
export * from './headers/selectors';
export * from './variables/selectors';
export * from './layout/selectors';
export * from './gql-schema/selectors';
export * from './collection/selectors';
export * from './pre-request/selectors';
