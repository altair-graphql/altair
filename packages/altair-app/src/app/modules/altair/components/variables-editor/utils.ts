import {
  getNullableType,
  GraphQLInputObjectType,
  GraphQLInputType,
  isEnumType,
  isLeafType,
  isListType,
  isNullableType,
  isSpecifiedScalarType,
} from 'graphql';
import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7Type,
  JSONSchema7TypeName,
} from 'json-schema';

/**
 * Maximum depth to traverse the GraphQL type tree for variable type resolution.
 * This is to prevent slow performance because of resolving the variable types and/or infinite recursion.
 */
const MAX_DEPTH = 4;

export type VariableToType = Record<string, GraphQLInputType>;

const specifiedScalarTypeToJSONSchemaType: Record<string, JSONSchema7TypeName> = {
  String: 'string',
  Int: 'integer',
  Float: 'number',
  Boolean: 'boolean',
  ID: 'string',
};
const wrapWithAnyOfNull = (def: JSONSchema7, wrap?: boolean) => {
  if (!wrap) {
    return def;
  }
  return {
    anyOf: [def, { type: 'null' as JSONSchema7TypeName }],
  };
};
export const graphqlInputTypeToJsonSchemaType = (
  originalType: GraphQLInputType,
  depth = 0,
  defaultValue?: JSONSchema7Type
): JSONSchema7 => {
  if (depth > MAX_DEPTH) {
    // Max depth reached. Default to string
    return { type: 'string' };
  }

  const type = getNullableType(originalType);

  // Handle enums
  if (isEnumType(type)) {
    return wrapWithAnyOfNull(
      {
        type: 'string',
        description: type.description ?? undefined,
        default: defaultValue,
        anyOf: type.getValues().map((v) => ({
          enum: [v.value],
          description: v.description ?? undefined,
        })),
      },
      isNullableType(originalType)
    );
  }
  if (isLeafType(type)) {
    if (isSpecifiedScalarType(type)) {
      return wrapWithAnyOfNull(
        {
          type: specifiedScalarTypeToJSONSchemaType[type.toString()] ?? 'string',
          description: type.description ?? undefined,
          default: defaultValue,
        },
        isNullableType(originalType)
      );
    }
    // custom scalar types default to string
    return wrapWithAnyOfNull(
      {
        type: 'string',
        description: type.description ?? undefined,
      },
      isNullableType(originalType)
    );
  }
  // Handle lists
  if (isListType(type)) {
    return wrapWithAnyOfNull(
      {
        type: 'array',
        items: graphqlInputTypeToJsonSchemaType(type.ofType, depth + 1),
        description: type.ofType?.description ?? undefined,
        default: defaultValue,
      },
      isNullableType(originalType)
    );
  }

  if (type instanceof GraphQLInputObjectType) {
    return {
      type: 'object',
      description: type.description ?? undefined,
      properties: Object.entries(type.getFields()).reduce(
        (acc, [key, field]) => {
          acc[key] = graphqlInputTypeToJsonSchemaType(
            field.type,
            depth + 1,
            field.defaultValue
          );
          return acc;
        },
        {} as Record<string, JSONSchema7Definition>
      ),
    };
  }

  // Unknown case. Default to string
  return { type: 'string' };
};

/*
 * Converts a VariableToType object to a JSON Schema object.
 * This is used to generate a JSON Schema for the variables editor.
 */
export const vttToJsonSchema = (vtt?: VariableToType): JSONSchema7 => {
  if (!vtt) {
    return {
      type: 'object',
      properties: {},
    };
  }
  return {
    type: 'object',
    properties: Object.entries(vtt).reduce(
      (acc, [key, type]) => {
        acc[key] = graphqlInputTypeToJsonSchemaType(type);
        return acc;
      },
      {} as Record<string, JSONSchema7Definition>
    ),
  };
};
