import {
  GraphQLType,
  GraphQLSchema,
  FragmentDefinitionNode,
  GraphQLFieldMap,
  TypeInfo,
  visitWithTypeInfo,
  visit,
  DocumentNode,
  getNamedType,
  FieldNode,
  Visitor,
  isLeafType,
  ArgumentNode,
  ValueNode,
  valueFromASTUntyped,
  Kind
} from 'graphql';
import { IDictionary } from '../../interfaces/shared';
import { debug } from '../../utils/logger';

/**
Refactor query:

- Name queries

- Factor out common fields to fragment

= Find all types in query that are not leaf types
= Create a tree of types
= Filter out types used more than once
Find fields from those types (leaf fields only for now)
Filter out fields used more than once
If fields are up to 2, create a fragment containing the common fields
Remove common fields from original queries
Add fragment in place of common fields

 */


interface TypeUsageMapEntry {
  name: string;
  count: number;
  type?: GraphQLType;
  fields: string[][];
  children: IDictionary<TypeUsageMapEntry>;
}

type FragmentRefactorMap = IDictionary<string[]>;

export const generateRandomNameForString = (value: string) =>
  value.trim().replace(/[^A-Za-z0-9]/g, '_').replace(/_+/g, '_').substr(0, 20) + (Math.random() * 1000).toFixed(0);

export const getTypeName = (type: GraphQLType) => getNamedType(type).toString();

export const getRefactoredFragmentName = (typeName: string) => `${typeName}Fields`;

export const getFragmentSpreadNode = (name: string) => {
  return {
    kind: Kind.FRAGMENT_SPREAD,
    name: {
      kind: Kind.NAME,
      value: name,
    }
  }
};

export const getFragmentDefinitionFromRefactorMap = (
  refactorMap: FragmentRefactorMap,
  schema: GraphQLSchema,
): FragmentDefinitionNode[] => {
  return Object.keys(refactorMap).map((typeName) => {
    const type = schema.getType(typeName);
    const fieldsMap: GraphQLFieldMap<any, any> = type && (type as any).getFields();

    return {
      kind: Kind.FRAGMENT_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: getRefactoredFragmentName(typeName),
      },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: typeName,
        }
      },
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: refactorMap[typeName].map((field) => {
          const fieldValue = fieldsMap && fieldsMap[field];
          return {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: field,
            },
            type: fieldValue ? fieldValue.type.inspect() : ''
          };
        })
      }
    }
  });
}

/**
 * Replaces fields matching the given refactor map with the equivalent fragment spread
 * Note: This doesn't generate the fragment. Only generates the fragment spread within the queries
 */
export const refactorFieldsWithFragmentSpread = (
  ast: DocumentNode,
  refactorMap: FragmentRefactorMap,
  schema: GraphQLSchema
) => {

  const typeInfo = new TypeInfo(schema);
  const edited = visit(ast, visitWithTypeInfo(typeInfo, {
    Field: {
      enter(node) {
        typeInfo.enter(node);
        const type = typeInfo.getType();
        if (type) {
          const typeName = getTypeName(type);
          const refactorFields = refactorMap[typeName];
          if (
            refactorFields &&
            node.selectionSet &&
            refactorFields.every(
              field => !!node.selectionSet!.selections.find((selection: FieldNode) => selection.name.value === field)
            )
          ) {
            return {
              ...node,
              selectionSet: {
                ...node.selectionSet,
                selections: [
                  ...node.selectionSet.selections.filter((selection: FieldNode) => !refactorFields.includes(selection.name.value)),
                  getFragmentSpreadNode(getRefactoredFragmentName(typeName)),
                ]
              }
            }
          }
        }
      },
      leave(node) {
        typeInfo.leave(node);
      }
    },
  }));

  return edited;
};

/**
 * Gathers usage information of all the object types (doesn't consider primitives/leaf types)
 * that are found in the given document node
 */
export const generateTypeUsageEntries = (
  ast: DocumentNode,
  schema: GraphQLSchema,
) => {
  const typeInfo = new TypeInfo(schema);
  const typeTree: TypeUsageMapEntry = {
    name: 'root',
    count: 0,
    fields: [],
    children: {}
  };
  const typesMap: IDictionary<TypeUsageMapEntry> = {
    root: typeTree,
  };

  function createTypeMapEntry(type: GraphQLType) {
    const namedType = getNamedType(type);
    const namedTypeStr = namedType.toString();
    typesMap[namedTypeStr] = typesMap[namedTypeStr] || {
      name: namedTypeStr,
      count: 0,
      type: namedType,
      fields: [],
      children: {},
    };

    return typesMap[namedTypeStr];
  }

  const innerVisitor: Visitor<any> = {
    enter(node) {
      typeInfo.enter(node);
      const type = typeInfo.getType();
      node.type = type;
      if (type && !isLeafType(getNamedType(type))) {
        // debug.log('REFACTOR', node, typeInfo.getFieldDef() && typeInfo.getFieldDef().name, typeInfo.getParentType());

        const typeMapEntry = createTypeMapEntry(type)
        typeMapEntry.count++;
        if (node.selectionSet && node.selectionSet.selections) {
          const currentNodeFields = node.selectionSet.selections
            // Only consider leaf fields for refactoring (not nested fields)
            .filter((selection: any) => !selection.selectionSet || !selection.selectionSet.selections)
            // Only consider fields
            .filter((selection: any) => selection.kind === Kind.FIELD)
            .filter((selection: any) => selection.name && selection.name.value)
            .map((selection: any) => selection.name && selection.name.value)
            .filter(Boolean);
          typeMapEntry.fields.push(currentNodeFields);
        }
        // Get parent type
        // Add parent type to map
        // Add field type as child of parent type in map
        const parentType = typeInfo.getParentType();
        if (parentType) {
          const parentTypeMapEntry = createTypeMapEntry(parentType);
          parentTypeMapEntry.children[typeMapEntry.name] = typeMapEntry;
        } else {
          typeTree.children[typeMapEntry.name] = typeMapEntry;
        }
      }
      return node;
    },
    leave(node) {
      typeInfo.leave(node);
    }
  };

  const visitor: any = {
    OperationDefinition: innerVisitor,
    Field: innerVisitor,
  }
  visit(ast, visitWithTypeInfo(typeInfo, visitor));

  return {
    map: typesMap,
    tree: typeTree,
  };
};

/**
 * Generate a mapping of types (that meet criteria) to a list
 * of common field names that can be refactored into a fragment
 */
export const generateFragmentRefactorMap = (
  typeUsageEntries: { map: IDictionary<TypeUsageMapEntry>, tree: TypeUsageMapEntry },
) => {

    /*
     Walk through the type tree to find the types that meets the criteria:
     - count >= 2
     - matching fields >= 2

     Considering that we would only consider leaf fields at the moment,
     we can simply look through all the types in the type map that match the criteria.

     In the future when object types are also considered as part of the fragmentation refactoring,
     we would need to only consider the first set of types in the tree that meet the criteria
     and not consider the types in sub levels of the tree.
     */
    const fragmentRefactorMap: FragmentRefactorMap = {};
    Object.values(typeUsageEntries.map).forEach(typeMap => {
      if (typeMap.count >= 2) {
        if (typeMap.fields.length) {
          typeMap.fields[0].forEach(field => {
            if (typeMap.fields.slice(1).every(list => list.includes(field))) {
              fragmentRefactorMap[typeMap.name] = fragmentRefactorMap[typeMap.name] || [];
              fragmentRefactorMap[typeMap.name].push(field);
            }
          });
        }
      }
    });

    return fragmentRefactorMap;
};

/**
 * Adds Fragment definitions to the document corresponding to the given refactor map
 */
export const addFragmentDefinitionFromRefactorMap = (
  ast: DocumentNode,
  refactorMap: FragmentRefactorMap,
  schema: GraphQLSchema
) => {
  return visit(ast, {
    Document(node) {
      return {
        ...node,
        definitions: node.definitions.concat(getFragmentDefinitionFromRefactorMap(refactorMap, schema)),
      }
    }
  });
};

const argumentValueToJS = (argValue: ValueNode, variables?: IDictionary) => {
  return valueFromASTUntyped(argValue, variables);
};

const argumentNodeToJS = (argumentNode: ArgumentNode, variables?: IDictionary) => {
  return argumentValueToJS(argumentNode.value, variables);
};

export const refactorArgumentsToVariables = (
  ast: DocumentNode,
  schema: GraphQLSchema,
  variables?: IDictionary,
) => {

  interface VariableMapEntry {
    name: string;
    value: any;
    type: string;
  };
  const variablesMap: IDictionary<VariableMapEntry> = {};
  let variablesPipeline: VariableMapEntry[] = [];

  // Get complex arguments, replacing them with variables and creating a variables map at the same time
  // Filter out same variables
  // Return stripped out query and unique variables
  // refactorArgumentsToVariables
  const typeInfo = new TypeInfo(schema);
  const edited = visit(ast, {
    enter(node) {
      typeInfo.enter(node);
      switch (node.kind) {
        case Kind.ARGUMENT: {
          const fieldDef = typeInfo.getFieldDef();
          if (node.value.kind !== Kind.VARIABLE && fieldDef && fieldDef.args) {
            const foundArg = fieldDef.args.find(arg => arg.name === node.name.value);
            if (foundArg) {
              const variableName = generateRandomNameForString(foundArg.name);
              const variableMapEntry = {
                name: variableName,
                value: argumentNodeToJS(node, variables),
                type: foundArg.type.inspect(),
              };
              variablesMap[variableName] = variableMapEntry;
              variablesPipeline.push(variableMapEntry);
              return {
                ...node,
                value: {
                  kind: Kind.VARIABLE,
                  name: {
                    kind: Kind.NAME,
                    value: variableName,
                  }
                }
              };
            }
          }
        }
        break;
      }
    },
    leave(node) {
      typeInfo.leave(node);
      switch (node.kind) {
        case Kind.OPERATION_DEFINITION: {
          // debug.log('REFACTOR', variablesPipeline);
          const newNode = {
            ...node,
            variableDefinitions: (node.variableDefinitions || []).concat(
              variablesPipeline.map(variableMapEntry => {
                return {
                  kind: Kind.VARIABLE_DEFINITION,
                  variable: {
                    kind: Kind.VARIABLE,
                    name: {
                      kind: Kind.NAME,
                      value: variableMapEntry.name,
                    }
                  },
                  type: {
                    kind: Kind.NAMED_TYPE,
                    name: {
                      kind: Kind.NAME,
                      value: variableMapEntry.type
                    }
                  }
                };
              })
            )
          }
          // Set operation name if none exists
          const nameKind = node.name || {
            kind: Kind.NAME,
            value: generateRandomNameForString('refactored'),
          };
          newNode.name = nameKind;
          variablesPipeline = [];
          return newNode;
        }
      }
    },
  });
  return {
    document: edited,
    variables: Object.keys(variablesMap).reduce((result: IDictionary, variableName) => {
      result[variableName] = variablesMap[variableName].value;
      return result;
    }, {})
  };
};
