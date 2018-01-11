import { Action as queryAction } from './query/query';
import { Action as gqlSchemaAction } from './gql-schema/gql-schema';

export type Action = queryAction | gqlSchemaAction;
