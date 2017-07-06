import { combineReducers, Action, ActionReducer } from '@ngrx/store';
import { compose } from '@ngrx/core/compose';
import { localStorageSync } from 'ngrx-store-localstorage';

import { environment } from '../../environments/environment';

import * as fromLayout from './layout/layout';
import * as fromQuery from './query/query';
import * as fromHeaders from './headers/headers';
import * as fromVariables from './variables/variables';
import * as fromDialogs from './dialogs/dialogs';
import * as fromGqlSchema from './gql-schema/gql-schema';
import * as fromDocs from './docs/docs';
import * as fromWindows from './windows';

export interface State {
    layout: fromLayout.State;
    query: fromQuery.State;
    headers: fromHeaders.State;
    variables: fromVariables.State;
    dialogs: fromDialogs.State;
    schema: fromGqlSchema.State;
    docs: fromDocs.State;
    // windows: fromWindows.State;
}

const reducers = {
    layout: fromLayout.layoutReducer,
    query: fromQuery.queryReducer,
    headers: fromHeaders.headerReducer,
    variables: fromVariables.variableReducer,
    dialogs: fromDialogs.dialogReducer,
    schema: fromGqlSchema.gqlSchemaReducer,
    docs: fromDocs.docsReducer,
    // windows: fromWindows.windowReducer
};

// Meta reducer to log actions
const log = (reducer) => (state: State, action: Action) => {
    if (!environment.production) {
        console.log(action.type, action);
    }
    return reducer(state, action);
};

export const reducer: ActionReducer<State> = compose(
    localStorageSync({ keys: ['windows'], rehydrate: true, storageKeySerializer: (key) => 'altair_' + key }),
    log,
    combineReducers
)({ windows: fromWindows.windows(combineReducers(reducers)) });
