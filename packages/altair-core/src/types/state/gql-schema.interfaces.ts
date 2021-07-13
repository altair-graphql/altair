import { GraphQLSchema, IntrospectionQuery } from 'graphql';

export interface GQLSchemaState {
  // Adding undefined for backward compatibility
  introspection?: IntrospectionQuery;
  // Adding undefined for backward compatibility
  schema?: GraphQLSchema;
  sdl: string;
  allowIntrospection: boolean;
  lastUpdatedAt?: number;
}
