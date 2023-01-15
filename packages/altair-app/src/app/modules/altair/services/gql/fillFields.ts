import { visit, print, TypeInfo, parse, GraphQLSchema, Kind } from 'graphql';
import { debug } from '../../utils/logger';
import getTypeInfo from 'codemirror-graphql/utils/getTypeInfo';
import { Token } from 'codemirror';
import { ContextToken } from 'graphql-language-service';
import { buildSelectionSet } from './generateQuery';
import { Position } from '../../utils/editor/helpers';

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

export const withInsertions = (
  initialQuery: string,
  insertions: { index: number; string: string }[]
) => {
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
};

export interface FillAllFieldsOptions {
  maxDepth?: number;
}

// Improved version based on:
// https://github.com/graphql/graphiql/blob/272e2371fc7715217739efd7817ce6343cb4fbec/src/utility/fillLeafs.js
export const fillAllFields = (
  schema: GraphQLSchema,
  query: string,
  cursor: Position,
  token: ContextToken,
  { maxDepth = 1 }: FillAllFieldsOptions = {}
) => {
  const insertions: { index: number; string: string }[] = [];
  if (!schema) {
    return { insertions, result: query };
  }

  let tokenState = token.state as any;
  if (tokenState.kind === Kind.SELECTION_SET) {
    tokenState.wasSelectionSet = true;
    tokenState = { ...tokenState, ...tokenState.prevState };
  }
  const fieldType = getTypeInfo(schema, token.state).type;
  // Strip out empty selection sets since those throw errors while parsing query
  query = query.replace(/{\s*}/g, '');
  const ast = parseQuery(query);

  if (!fieldType || !ast) {
    return { insertions, result: query };
  }

  const typeInfo = new TypeInfo(schema);
  const edited = visit(ast, {
    leave(node) {
      // typeInfo.leave(node);
      debug.log(node);
    },
    enter(node) {
      typeInfo.enter(node);
      if (node.kind === Kind.FIELD) {
        // const fieldType = typeInfo.getType();
        if (
          1 &&
          node.name.value === tokenState.name &&
          node.loc &&
          // With tokenState of SelectionSet (i.e. between braces { | }),
          // we wouldn't have the right position since we strip out the empty braces before
          // parsing the query to make it valid
          // AST line number is 1-indexed while codemirror cursor line number is 0-indexed.
          (tokenState.wasSelectionSet ||
            node.loc.startToken.line - 1 === cursor.line)
        ) {
          debug.log(
            node,
            typeInfo,
            typeInfo.getType(),
            cursor,
            token,
            maxDepth
          );
          const { selectionSet } = buildSelectionSet(fieldType, { maxDepth });
          const indent = getIndentation(query, node.loc.start);
          if (selectionSet) {
            insertions.push({
              index: node.loc.end,
              string: ' ' + print(selectionSet).replace(/\n/g, '\n' + indent),
            });
          }
          return {
            ...node,
            selectionSet,
          };
        }
      }
    },
  });

  return {
    insertions,
    result: withInsertions(query, insertions),
  };
};
