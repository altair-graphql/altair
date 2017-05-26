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
            return state;
        case gqlSchema.SET_SCHEMA:
            return state;
        default:
            return state;
    }
}