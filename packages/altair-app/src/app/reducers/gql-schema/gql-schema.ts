import { Action } from '@ngrx/store';

import * as gqlSchema from '../../actions/gql-schema/gql-schema';
import { GraphQLSchema, IntrospectionQuery } from 'graphql';

export interface State {
  // Adding undefined for backward compatibility
  introspection?: IntrospectionQuery;
  // Adding undefined for backward compatibility
  schema?: GraphQLSchema;
  sdl: string;
  allowIntrospection: boolean;
  lastUpdatedAt?: number;
}

export const getInitialState = (): State => {
  return {
    sdl: '',
    allowIntrospection: true
  };
};

export function gqlSchemaReducer(state = getInitialState(), action: gqlSchema.Action): State {
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
    case gqlSchema.SET_INTROSPECTION_LAST_UPDATED_AT:
      return { ...state, lastUpdatedAt: action.payload.epoch };
    default:
      return state;
  }
}
