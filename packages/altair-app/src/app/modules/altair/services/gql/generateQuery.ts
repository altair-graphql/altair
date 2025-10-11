import {
  ArgumentNode,
  astFromValue,
  DocumentNode,
  FragmentDefinitionNode,
  getNamedType,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLType,
  isInputObjectType,
  isLeafType,
  isListType,
  isNonNullType,
  isObjectType,
  isRequiredInputField,
  Kind,
  ObjectFieldNode,
  OperationDefinitionNode,
  OperationTypeNode,
  print,
  SelectionSetNode,
  ValueNode,
} from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import { getTypeName } from './helpers';
import { prettify } from './prettifier';

interface GenerateMeta {
  hasArgs?: boolean;
}

export const generateQuery = async (
  schema: GraphQLSchema,
  name: string,
  parentType: string,
  { maxDepth = 2, tabSize = 2 } = {}
) => {
  const parentTypeObject = schema.getType(parentType);

  if (!(parentTypeObject instanceof GraphQLObjectType)) {
    return { generated: '', metas: [] };
  }
  const field = parentTypeObject.getFields()[name];

  if (!field) {
    return { generated: '', metas: [] };
  }

  const operationType = getOperationType(schema, parentTypeObject);

  const { node: selectionNode, metas } = buildSelectionNode(field, {
    maxDepth,
    currentDepth: 0,
  });
  const selectionSet = {
    kind: Kind.SELECTION_SET,
    // start building actual content here
    selections: [selectionNode],
  };

  const x: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      operationType
        ? buildOperationDefinitionWrapper(operationType, selectionSet)
        : buildFragmentDefinitionWrapper(parentTypeObject, selectionSet),
    ],
  };

  return {
    generated: await prettify(print(x), tabSize),
    metas,
  };
};

const getOperationType = (schema: GraphQLSchema, type: GraphQLObjectType) => {
  const typeToOperation = new Map<
    Maybe<GraphQLObjectType<any, any>>,
    OperationTypeNode
  >([
    [schema.getQueryType(), 'query'],
    [schema.getMutationType(), 'mutation'],
    [schema.getSubscriptionType(), 'subscription'],
  ]);

  return typeToOperation.get(type);
};

// operation definition would wrap a selection to return a query AST (for fields from root types)
const buildOperationDefinitionWrapper = (
  operationType: OperationTypeNode,
  selectionSet: SelectionSetNode
): OperationDefinitionNode => {
  return {
    kind: Kind.OPERATION_DEFINITION,
    operation: operationType,
    name: undefined,
    variableDefinitions: [],
    directives: [],
    selectionSet,
  };
};

// fragment definition would wrap a selection to return a fragment AST
const buildFragmentDefinitionWrapper = (
  parentType: GraphQLObjectType,
  selectionSet: SelectionSetNode
): FragmentDefinitionNode => {
  return {
    kind: Kind.FRAGMENT_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: '____',
    },
    variableDefinitions: [],
    directives: [],
    typeCondition: {
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
        value: parentType.name,
      },
    },
    selectionSet,
  };
};

export const buildSelectionSet = (
  type: GraphQLType | null,
  { maxDepth = 1, currentDepth = 0 } = {}
): { selectionSet: SelectionSetNode; metas: GenerateMeta[] } => {
  let setMetas: GenerateMeta[] = [];
  const selectionSet: SelectionSetNode = {
    kind: Kind.SELECTION_SET,
    selections: [],
  };

  if (!type) {
    return { selectionSet, metas: setMetas };
  }
  const namedType = getNamedType(type);

  if (
    !(
      namedType instanceof GraphQLObjectType ||
      namedType instanceof GraphQLInterfaceType
    )
  ) {
    return { selectionSet, metas: setMetas };
  }

  if (isLeafType(type)) {
    return { selectionSet, metas: setMetas };
  }

  if (currentDepth >= maxDepth) {
    return { selectionSet, metas: setMetas };
  }

  const fields = namedType && namedType.getFields();
  selectionSet.selections = Object.entries(fields).map(([, field]) => {
    const { node, metas } = buildSelectionNode(field, {
      maxDepth,
      currentDepth,
    });

    setMetas = [...setMetas, ...metas];

    return node;
  });

  return { selectionSet, metas: setMetas };
};

export const buildSelectionNode = (
  field: GraphQLField<any, any>,
  { maxDepth = 1, currentDepth = 0 } = {}
) => {
  const argumentsNodes: ArgumentNode[] = field.args.map((arg) => {
    return {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: arg.name,
      },
      value: buildDefaultArgumentValueNode(arg.type, arg.defaultValue),
    };
  });

  const { selectionSet, metas } = buildSelectionSet(field.type, {
    maxDepth,
    currentDepth: currentDepth + 1,
  });

  const node = {
    kind: Kind.FIELD,
    alias: undefined,
    name: {
      kind: Kind.NAME,
      value: field.name,
    },
    arguments: argumentsNodes,
    directives: [],
    selectionSet,
  } as const;

  return { node, metas: [{ hasArgs: !!argumentsNodes.length }, ...metas] };
};

// Generate default values based on the GraphQL type
const buildDefaultArgumentValueNode = (
  argumentType: GraphQLInputType,
  defaultValue?: unknown,
  { currentDepth = 0, maxDepth = 2 } = {}
): ValueNode => {
  return (
    maybeBuildDefaultArgumentValueNode(argumentType, defaultValue, {
      currentDepth,
      maxDepth,
    }) ?? { kind: Kind.STRING, value: '_____' }
  );
};
const maybeBuildDefaultArgumentValueNode = (
  type: GraphQLInputType,
  defaultValue?: unknown,
  { currentDepth = 0, maxDepth = 2 } = {}
): ValueNode | undefined | null => {
  const defaultValueNode = astFromValue(defaultValue, type);
  if (defaultValueNode) {
    return defaultValueNode;
  }

  if (isNonNullType(type)) {
    type = type.ofType;
  }

  // handle lists
  if (isListType(type)) {
    const value: ValueNode = {
      kind: Kind.LIST,
      values: [
        buildDefaultArgumentValueNode(type.ofType, undefined, {
          currentDepth: currentDepth + 1,
          maxDepth,
        }),
      ],
    };
    return value;
  }

  // handle complex objects
  if (isObjectType(type) || isInputObjectType(type)) {
    if (currentDepth >= maxDepth) {
      return;
    }

    const fieldNodes: ObjectFieldNode[] = [];
    for (const field of Object.values(
      (type as GraphQLInputObjectType).getFields()
    )) {
      if (isRequiredInputField(field)) {
        const fieldValue = maybeBuildDefaultArgumentValueNode(
          field.type,
          undefined,
          { currentDepth: currentDepth + 1, maxDepth }
        );
        if (fieldValue) {
          fieldNodes.push({
            kind: Kind.OBJECT_FIELD,
            name: { kind: Kind.NAME, value: field.name },
            value: fieldValue,
          });
        }
      }
    }
    return { kind: Kind.OBJECT, fields: fieldNodes };
  }

  if (type instanceof GraphQLEnumType) {
    const defaultValue = type.getValues()[0];

    if (!defaultValue) {
      return;
    }

    return astFromValue(defaultValue.name, type);
  }

  const typeName = getTypeName(type);

  switch (typeName) {
    case 'String': {
      return astFromValue('string', GraphQLString);
    }
    case 'Boolean': {
      return astFromValue(true, GraphQLBoolean);
    }
    case 'Int': {
      return astFromValue(1, GraphQLInt);
    }
  }
};
