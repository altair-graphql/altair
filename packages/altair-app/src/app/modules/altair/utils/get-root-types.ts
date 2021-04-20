import { GraphQLSchema, GraphQLObjectType } from 'graphql';

export default (schema: GraphQLSchema) => {
  return [
    schema.getQueryType(),
    schema.getMutationType(),
    schema.getSubscriptionType()
  ].filter(Boolean) as GraphQLObjectType[];
}
