import { Action as NGRXAction } from '@ngrx/store';
import { Action as queryAction } from './query/query';
import { Action as gqlSchemaAction } from './gql-schema/gql-schema';

export interface ActionWithPayload extends NGRXAction {
  payload?: object;
}

export type Action = queryAction | gqlSchemaAction;
