import { Action } from '@ngrx/store';

import * as gqlSchema from '../../actions/gql-schema/gql-schema';

export interface Variable {
    key: string;
    value: string;
}

export interface State {
    introspection: object;
    schema: object;
}

const initialState: State = {
    introspection: {},
    schema: null
};

export function gqlSchemaReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case gqlSchema.SET_INTROSPECTION:
        case gqlSchema.SET_INTROSPECTION_FROM_DB:
            return Object.assign({}, state, { introspection: action.payload });
        case gqlSchema.SET_SCHEMA:
            return Object.assign({}, state, { schema: action.payload });
        default:
            return state;
    }
}
