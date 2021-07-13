import { Action } from '@ngrx/store';
import { GQLSchemaState } from 'altair-graphql-core/build/types/state/gql-schema.interfaces';

import * as gqlSchema from './gql-schema.action';


export const getInitialState = (): GQLSchemaState => {
  return {
    sdl: '',
    allowIntrospection: true
  };
};

export function gqlSchemaReducer(state = getInitialState(), action: gqlSchema.Action): GQLSchemaState {
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
