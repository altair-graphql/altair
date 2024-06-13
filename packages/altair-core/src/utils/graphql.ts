import { DocumentNode, Kind, OperationDefinitionNode, parse } from 'graphql';

const getEmptyDocumentNode = (): DocumentNode => {
  return {
    definitions: [],
    kind: Kind.DOCUMENT,
  };
};
const parseQueryOrEmptyDocument = (query: string) => {
  if (!query) {
    return getEmptyDocumentNode();
  }

  try {
    return parse(query);
  } catch (err) {
    console.error('Error parsing query, returning empty instead', err);

    return getEmptyDocumentNode();
  }
};

export const getOperations = (query: string) => {
  const parsedQuery = parseQueryOrEmptyDocument(query);

  if (parsedQuery.definitions) {
    return parsedQuery.definitions.filter(
      (def): def is OperationDefinitionNode =>
        !!(def.kind === 'OperationDefinition' && def.name?.value)
    );
  }

  return [];
};
