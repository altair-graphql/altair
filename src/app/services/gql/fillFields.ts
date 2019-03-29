import {
  visit,
  print,
  TypeInfo,
  getNamedType,
  isLeafType,
  parse,
} from 'graphql';
import { debug } from 'app/utils/logger';

export const parseQuery = (query: string) => {
  if (!query) {
    return null;
  }
  try {
    return parse(query);
  } catch (err) {
    debug.error('Something wrong with your query', err);

    return null;
  }
};

export const buildSelectionSet = (type, { maxDepth = 1, currentDepth = 0 } = {}) => {
  const namedType = getNamedType(type);

  if (!type || isLeafType(type) || !namedType.getFields) {
    return;
  }

  if (currentDepth >= maxDepth) {
    return;
  }

  const fields = namedType.getFields();
  return {
    kind: 'SelectionSet',
    selections: Object.keys(fields).map(field => {
      const fieldDef = fields[field];
      const fieldType = fieldDef ? fieldDef.type : null;

      return {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: field
        },
        selectionSet: buildSelectionSet(fieldType, { maxDepth, currentDepth: currentDepth + 1 })
      };
    })
  };
};

export const getIndentation = (str: string, index: number) => {
  let indentStart = index;
  let indentEnd = index;
  while (indentStart) {
    const c = str.charCodeAt(indentStart - 1);
    // line break
    if (c === 10 || c === 13 || c === 0x2028 || c === 0x2029) {
      break;
    }
    indentStart--;
    // not white space
    if (c !== 9 && c !== 11 && c !== 12 && c !== 32 && c !== 160) {
      indentEnd = indentStart;
    }
  }
  return str.substring(indentStart, indentEnd);
};

export const withInsertions = (initialQuery: string, insertions) => {
  if (insertions.length === 0) {
    return initialQuery;
  }
  let edited = '';
  let prevIndex = 0;
  insertions.forEach(({ index, string }) => {
    edited += initialQuery.slice(prevIndex, index) + string;
    prevIndex = index;
  });
  edited += initialQuery.slice(prevIndex);
  return edited;
}

// Improved version based on:
// https://github.com/graphql/graphiql/blob/272e2371fc7715217739efd7817ce6343cb4fbec/src/utility/fillLeafs.js
export const fillAllFields = (schema, query: string, cursor, token) => {
  const insertions = [];
  if (!schema) {
    return { insertions, result: query };
  }

  const ast = parseQuery(query);

  if (!ast) {
    return { insertions, result: query };
  }

  const typeInfo = new TypeInfo(schema);
  const edited = visit(ast, {
    leave(node) {
      typeInfo.leave(node);
      debug.log(node);
    },
    enter(node) {
      typeInfo.enter(node);
      if (node.kind === 'Field') {
        const fieldType = typeInfo.getType();
        if (
          1
          && node.name.value === token.state.name

          && node.loc
          // AST line number is 1-indexed while codemirror cursor line number is 0-indexed.
          && node.loc.startToken.line - 1 === cursor.line
        ) {
          debug.log(node, typeInfo, typeInfo.getType(), cursor, token);
          const selectionSet = buildSelectionSet(fieldType);
          const indent = getIndentation(query, node.loc.start);
          if (selectionSet) {
            insertions.push({
              index: node.loc.end,
              string: ' ' + print(selectionSet).replace(/\n/g, '\n' + indent),
            });
          }
          return {
            ...node,
            selectionSet
          };
        }
      }
    },
  });

  return {
    insertions,
    result: withInsertions(query, insertions)
  };
};
