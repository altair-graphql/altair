import {
  FragmentDefinitionNode,
  getIntrospectionQuery as getGraphQLIntrospectionQuery,
  parse,
  print,
  visit,
} from 'graphql';

// Four list and five non-null wrappers require nine `ofType` selections.
// This also matches the default depth introduced in graphql@16.8.
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
  options?: Parameters<typeof getGraphQLIntrospectionQuery>[0]
): string => {
  const queryDocument = parse(getGraphQLIntrospectionQuery(options));
  const typeRefDocument = parse(
    `fragment TypeRef on __Type {\n${getTypeRefSelection(TYPE_REF_DEPTH)}\n}`
  );
  const typeRefFragment = typeRefDocument.definitions[0] as FragmentDefinitionNode;
  let replacedTypeRef = false;

  const updatedQuery = visit(queryDocument, {
    FragmentDefinition(node) {
      if (node.name.value === 'TypeRef') {
        replacedTypeRef = true;
        return typeRefFragment;
      }

      return undefined;
    },
  });

  if (!replacedTypeRef) {
    throw new Error('TypeRef fragment not found in GraphQL introspection query');
  }

  return print(updatedQuery);
};
