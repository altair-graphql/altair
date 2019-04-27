import { Action } from '@ngrx/store';

import * as gqlSchema from '../../actions/gql-schema/gql-schema';

export interface State {
    introspection: object;
    schema: object;
    sdl: string;
    allowIntrospection: boolean;
}

export const initialState: State = {
    introspection: null,
    schema: null,
    sdl: '',
    allowIntrospection: true
};

export function gqlSchemaReducer(state = initialState, action: gqlSchema.Action): State {
    switch (action.type) {
        case gqlSchema.SET_INTROSPECTION:
        case gqlSchema.SET_INTROSPECTION_FROM_DB:
            return { ...state, introspection: action.payload };
        case gqlSchema.SET_SCHEMA:
            return { ...state, schema: action.payload };
        case gqlSchema.SET_ALLOW_INTROSPECTION:
            return { ...state, allowIntrospection: action.payload };
        case gqlSchema.SET_SCHEMA_SDL:
            return { ...state, sdl: action.payload.sdl };
        default:
            return state;
    }
}
