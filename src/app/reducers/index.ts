import { combineReducers, Action, ActionReducer } from '@ngrx/store';

import * as fromQuery from './query/query';
import * as fromHeaders from './headers/headers';
import * as fromVariables from './variables/variables';
import * as fromDialogs from './dialogs/dialogs';
import * as fromGqlSchema from './gql-schema/gql-schema';
import * as fromDocs from './docs/docs';

export interface State {
    query: fromQuery.State;
    headers: Array<fromHeaders.Header>;
    variables: fromVariables.State;
    dialogs: fromDialogs.State;
    schema: fromGqlSchema.State;
    docs: fromDocs.State;
}

const reducers = {
    query: fromQuery.queryReducer,
    headers: fromHeaders.headerReducer,
    variables: fromVariables.variableReducer,
    dialogs: fromDialogs.dialogReducer,
    schema: fromGqlSchema.gqlSchemaReducer,
    docs: fromDocs.docsReducer
};

const _reducer: ActionReducer<State> = combineReducers(reducers);

// add a wrapper around the reducers to log the actions
export function reducer(state: State, action: Action) {
    console.log(action.type, action);
    return _reducer(state, action);
};
