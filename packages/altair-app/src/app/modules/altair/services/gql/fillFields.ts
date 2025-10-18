import {
  visit,
  print,
  TypeInfo,
  parse,
  GraphQLSchema,
  Kind,
  isInputObjectType,
  GraphQLInputObjectType,
} from 'graphql';
import { debug } from '../../utils/logger';
import getTypeInfo from 'codemirror-graphql/utils/getTypeInfo';
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

const buildInputObjectFields = (
  inputType: GraphQLInputObjectType,
  { maxDepth = 1, currentDepth = 0 } = {}
): string => {
  if (currentDepth >= maxDepth) {
    return '';
  }

  const fields = inputType.getFields();
  const fieldEntries = Object.entries(fields).map(([fieldName, field]) => {
    // Unwrap the type to get to the base type (remove NonNull and List wrappers)
    let unwrappedType = field.type;
    while (
      unwrappedType &&
      ('ofType' in unwrappedType) &&
      unwrappedType.ofType
    ) {
      unwrappedType = unwrappedType.ofType as any;
    }
    
    // For nested input objects, recursively build fields
    if (isInputObjectType(unwrappedType)) {
      if (currentDepth + 1 < maxDepth) {
        const nestedFields = buildInputObjectFields(unwrappedType, {
          maxDepth,
          currentDepth: currentDepth + 1,
        });
        return `${fieldName}: {${nestedFields ? `\n  ${nestedFields}\n` : ''}}`;
      }
      return `${fieldName}: `;
    }
    
    // For scalar types, just add the field name
    return `${fieldName}: `;
  });

  return fieldEntries.join('\n');
};

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
  let isSelectionSetMode = false;
  let isObjectValueMode = false;
  
  if (tokenState.kind === Kind.SELECTION_SET) {
    tokenState.wasSelectionSet = true;
    tokenState = { ...tokenState, ...tokenState.prevState };
    isSelectionSetMode = true;
  }
  // Check if we're in an object value (argument)
  // The token state kind for object values is typically 'ObjectValue' or the token itself is '{'
  if (tokenState.kind === 'ObjectValue' || tokenState.kind === '{') {
    tokenState.wasObjectValue = true;
    tokenState = { ...tokenState, ...tokenState.prevState };
    isObjectValueMode = true;
  }
  
  const typeInfoResult = getTypeInfo(schema, token.state);
  const fieldType = typeInfoResult.type;
  const inputType = typeInfoResult.inputType;
  
  // For object value mode (arguments), handle specially without stripping
  if (isObjectValueMode && inputType && isInputObjectType(inputType)) {
    // Don't strip, parse as-is since `{ }` is valid for arguments
    const ast = parseQuery(query);
    if (!ast) {
      return { insertions, result: query };
    }
    
    const typeInfo = new TypeInfo(schema);
    visit(ast, {
      enter(node) {
        typeInfo.enter(node);
        // Find the OBJECT node at the cursor position
        if (node.kind === Kind.OBJECT && node.loc &&
            node.loc.startToken.line - 1 === cursor.line) {
          const currentInputType = typeInfo.getInputType();
          if (currentInputType && isInputObjectType(currentInputType)) {
            const fieldsString = buildInputObjectFields(currentInputType, { maxDepth });
            const indent = getIndentation(query, node.loc.start);
            if (fieldsString && node.fields.length === 0) {
              // Only fill if the object is empty
              insertions.push({
                index: node.loc.start + 1,
                string: '\n' + indent + '  ' + fieldsString.replace(/\n/g, '\n' + indent + '  ') + '\n' + indent,
              });
            }
          }
        }
      },
    });
    
    return {
      insertions,
      result: withInsertions(query, insertions),
    };
  }
  
  // Original logic for selection sets
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
          debug.log(node, typeInfo, typeInfo.getType(), cursor, token, maxDepth);
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
