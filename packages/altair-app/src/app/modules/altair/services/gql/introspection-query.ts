import { getIntrospectionQuery as getGraphQLIntrospectionQuery } from 'graphql';

const TYPE_REF_DEPTH = 9;

const getTypeRefSelection = (depth: number, indentation = 4): string => {
  const indent = ' '.repeat(indentation);
  const fields = `${indent}kind\n${indent}name`;

  if (depth === 0) {
    return fields;
  }

  return `${fields}\n${indent}ofType {\n${getTypeRefSelection(
    depth - 1,
    indentation + 2
  )}\n${indent}}`;
};

/**
 * Generates an introspection query that supports deeply wrapped GraphQL types.
 *
 * graphql@15 only requests seven nested `ofType` fields, which is not enough
 * for valid types such as `[[[[Float!]!]!]!]!`. graphql@16.8 increased this
 * depth to nine; keep the same query shape while the app supports graphql@15.
 */
export const getIntrospectionQuery = (
  options: Parameters<typeof getGraphQLIntrospectionQuery>[0]
): string => {
  const query = getGraphQLIntrospectionQuery(options);
  const typeRefFragment = `fragment TypeRef on __Type {\n${getTypeRefSelection(
    TYPE_REF_DEPTH
  )}\n  }`;

  return query.replace(
    /fragment TypeRef on __Type \{[\s\S]*?\n {4}\}\n {2}$/,
    typeRefFragment
  );
};
