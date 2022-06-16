/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import invariant from 'graphql/jsutils/invariant';
import keyMap from 'graphql/jsutils/keyMap';
import keyValMap from 'graphql/jsutils/keyValMap';
import { valueFromAST } from 'graphql/utilities/valueFromAST';
import { parseValue } from 'graphql/language/parser';
import { GraphQLSchema } from 'graphql/type/schema';

import { DirectiveLocation } from 'graphql/language/directiveLocation';

import {
  isInputType,
  isOutputType,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  assertNullableType,
  assertObjectType,
  assertInterfaceType,
} from 'graphql/type/definition';

import {
  GraphQLType,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLNamedType,
} from 'graphql/type/definition';

import { GraphQLDirective } from 'graphql/type/directives';

import { introspectionTypes, TypeKind } from 'graphql/type/introspection';

import { specifiedScalarTypes } from 'graphql/type/scalars';

import {
  IntrospectionQuery,
  IntrospectionType,
  IntrospectionScalarType,
  IntrospectionObjectType,
  IntrospectionInterfaceType,
  IntrospectionUnionType,
  IntrospectionEnumType,
  IntrospectionInputObjectType,
  IntrospectionTypeRef,
  IntrospectionInputTypeRef,
  IntrospectionOutputTypeRef,
  IntrospectionNamedTypeRef,
  IntrospectionField,
  IntrospectionEnumValue,
  IntrospectionInputValue,
  IntrospectionDirective,
  GraphQLSchemaConfig,
} from 'graphql';

import { GraphQLSchemaValidationOptions } from 'graphql/type/schema';

type Options = GraphQLSchemaValidationOptions;

/**
 * Build a GraphQLSchema for use by client tools.
 *
 * Given the result of a client running the introspection query, creates and
 * returns a GraphQLSchema instance which can be then used with all graphql-js
 * tools, but cannot be used to execute a query, as introspection does not
 * represent the "resolver", "parse" or "serialize" functions or any other
 * server-internal mechanisms.
 *
 * This function expects a complete introspection result. Don't forget to check
 * the "errors" field of a server response before calling this function.
 */
export function buildClientSchema(
  introspection: IntrospectionQuery,
  options?: Options & { allowedLegacyNames: boolean }
): GraphQLSchema {
  // Get the schema from the introspection result.
  const schemaIntrospection = introspection.__schema;

  // Converts the list of types into a keyMap based on the type names.
  const typeIntrospectionMap = keyMap(
    schemaIntrospection.types,
    (type: Exclude<GraphQLType, GraphQLList<any>>) => type.name
  );

  // A cache to use to store the actual GraphQLType definition objects by name.
  // Initialize to the GraphQL built in scalars. All functions below are inline
  // so that this type def cache is within the scope of the closure.
  const typeDefCache = keyMap(
    (specifiedScalarTypes as any).concat(introspectionTypes),
    (type: Exclude<GraphQLType, GraphQLList<any>>) => type.name
  );

  // Given a type reference in introspection, return the GraphQLType instance.
  // preferring cached instances before building new instances.
  function getType(typeRef: IntrospectionTypeRef): GraphQLType {
    if (typeRef.kind === TypeKind.LIST) {
      const itemRef = typeRef.ofType;
      if (!itemRef) {
        throw new Error('Decorated type deeper than introspection query.');
      }
      return GraphQLList(getType(itemRef));
    }
    if (typeRef.kind === TypeKind.NON_NULL) {
      const nullableRef = typeRef.ofType;
      if (!nullableRef) {
        throw new Error('Decorated type deeper than introspection query.');
      }
      const nullableType = getType(nullableRef);
      return GraphQLNonNull(assertNullableType(nullableType));
    }
    if (!typeRef.name) {
      throw new Error('Unknown type reference: ' + JSON.stringify(typeRef));
    }
    return getNamedType(typeRef.name);
  }

  function getNamedType(typeName: string): GraphQLNamedType {
    if (typeDefCache[typeName]) {
      return typeDefCache[typeName];
    }
    const typeIntrospection = typeIntrospectionMap[typeName];
    if (!typeIntrospection) {
      throw new Error(
        `Invalid or incomplete schema, unknown type: ${typeName}. Ensure ` +
          'that a full introspection query is used in order to build a ' +
          'client schema.'
      );
    }
    const typeDef = buildType(typeIntrospection);
    typeDefCache[typeName] = typeDef;
    return typeDef;
  }

  function getInputType(typeRef: IntrospectionInputTypeRef): GraphQLInputType {
    const type = <GraphQLInputType>getType(typeRef);
    invariant(
      isInputType(type),
      'Introspection must provide input type for arguments.'
    );
    return type;
  }

  function getOutputType(
    typeRef: IntrospectionOutputTypeRef
  ): GraphQLOutputType {
    const type = <GraphQLOutputType>getType(typeRef);
    invariant(
      isOutputType(type),
      'Introspection must provide output type for fields.'
    );
    return type;
  }

  function getObjectType(
    typeRef: IntrospectionNamedTypeRef<IntrospectionObjectType>
  ): GraphQLObjectType {
    const type = getType(typeRef);
    return assertObjectType(type);
  }

  function getInterfaceType(
    typeRef: IntrospectionTypeRef
  ): GraphQLInterfaceType {
    const type = getType(typeRef);
    return assertInterfaceType(type);
  }

  // Given a type's introspection result, construct the correct
  // GraphQLType instance.
  function buildType(type: IntrospectionType): GraphQLNamedType {
    if (type && type.name && type.kind) {
      switch (type.kind) {
        case TypeKind.SCALAR:
          return buildScalarDef(type);
        case TypeKind.OBJECT:
          return buildObjectDef(type);
        case TypeKind.INTERFACE:
          return buildInterfaceDef(type);
        case TypeKind.UNION:
          return buildUnionDef(type);
        case TypeKind.ENUM:
          return buildEnumDef(type);
        case TypeKind.INPUT_OBJECT:
          return buildInputObjectDef(type);
      }
    }
    throw new Error(
      'Invalid or incomplete introspection result. Ensure that a full ' +
        'introspection query is used in order to build a client schema:' +
        JSON.stringify(type)
    );
  }

  function buildScalarDef(
    scalarIntrospection: IntrospectionScalarType
  ): GraphQLScalarType {
    return new GraphQLScalarType({
      name: scalarIntrospection.name,
      description: scalarIntrospection.description,
      serialize: (value) => value,
    });
  }

  function buildObjectDef(
    objectIntrospection: IntrospectionObjectType
  ): GraphQLObjectType {
    if (!objectIntrospection.interfaces) {
      throw new Error(
        'Introspection result missing interfaces: ' +
          JSON.stringify(objectIntrospection)
      );
    }
    return new GraphQLObjectType({
      name: objectIntrospection.name,
      description: objectIntrospection.description,
      interfaces: objectIntrospection.interfaces.map(getInterfaceType),
      fields: () => buildFieldDefMap(objectIntrospection),
    });
  }

  function buildInterfaceDef(
    interfaceIntrospection: IntrospectionInterfaceType
  ): GraphQLInterfaceType {
    return new GraphQLInterfaceType({
      name: interfaceIntrospection.name,
      description: interfaceIntrospection.description,
      fields: () => buildFieldDefMap(interfaceIntrospection),
    });
  }

  function buildUnionDef(
    unionIntrospection: IntrospectionUnionType
  ): GraphQLUnionType {
    if (!unionIntrospection.possibleTypes) {
      throw new Error(
        'Introspection result missing possibleTypes: ' +
          JSON.stringify(unionIntrospection)
      );
    }
    return new GraphQLUnionType({
      name: unionIntrospection.name,
      description: unionIntrospection.description,
      types: unionIntrospection.possibleTypes.map(getObjectType),
    });
  }

  function buildEnumDef(
    enumIntrospection: IntrospectionEnumType
  ): GraphQLEnumType {
    if (!enumIntrospection.enumValues) {
      throw new Error(
        'Introspection result missing enumValues: ' +
          JSON.stringify(enumIntrospection)
      );
    }
    return new GraphQLEnumType({
      name: enumIntrospection.name,
      description: enumIntrospection.description,
      values: keyValMap(
        enumIntrospection.enumValues,
        (valueIntrospection: IntrospectionEnumValue) => valueIntrospection.name,
        (valueIntrospection: IntrospectionEnumValue) => ({
          description: valueIntrospection.description,
          deprecationReason: valueIntrospection.deprecationReason,
        })
      ),
    });
  }

  function buildInputObjectDef(
    inputObjectIntrospection: IntrospectionInputObjectType
  ): GraphQLInputObjectType {
    if (!inputObjectIntrospection.inputFields) {
      throw new Error(
        'Introspection result missing inputFields: ' +
          JSON.stringify(inputObjectIntrospection)
      );
    }
    return new GraphQLInputObjectType({
      name: inputObjectIntrospection.name,
      description: inputObjectIntrospection.description,
      fields: () => buildInputValueDefMap(inputObjectIntrospection.inputFields),
    });
  }

  function buildFieldDefMap(
    typeIntrospection: IntrospectionType & {
      fields: ReadonlyArray<IntrospectionField>;
    }
  ) {
    if (!typeIntrospection.fields) {
      throw new Error(
        'Introspection result missing fields: ' +
          JSON.stringify(typeIntrospection)
      );
    }
    return keyValMap(
      typeIntrospection.fields,
      (fieldIntrospection: IntrospectionField) => fieldIntrospection.name,
      (fieldIntrospection: IntrospectionField) => {
        if (!fieldIntrospection.args) {
          throw new Error(
            'Introspection result missing field args: ' +
              JSON.stringify(fieldIntrospection)
          );
        }
        return {
          description: fieldIntrospection.description,
          deprecationReason: fieldIntrospection.deprecationReason,
          type: getOutputType(fieldIntrospection.type),
          args: buildInputValueDefMap(fieldIntrospection.args),
        };
      }
    );
  }

  function buildInputValueDefMap(
    inputValueIntrospections: ReadonlyArray<IntrospectionInputValue>
  ) {
    return keyValMap(
      inputValueIntrospections,
      (inputValue: IntrospectionInputValue) => inputValue.name,
      buildInputValue
    );
  }

  function buildInputValue(inputValueIntrospection: IntrospectionInputValue) {
    const type = getInputType(inputValueIntrospection.type);
    const defaultValue = inputValueIntrospection.defaultValue
      ? valueFromAST(parseValue(inputValueIntrospection.defaultValue), type)
      : undefined;
    return {
      name: inputValueIntrospection.name,
      description: inputValueIntrospection.description,
      type,
      defaultValue,
    };
  }

  function buildDirective(
    directiveIntrospection: IntrospectionDirective & {
      onField: any;
      onOperation: any;
      onFragment: any;
    }
  ) {
    // Support deprecated `on****` fields for building `locations`, as this
    // is used by GraphiQL which may need to support outdated servers.
    const locations = directiveIntrospection.locations
      ? directiveIntrospection.locations.slice()
      : ([] as any[]).concat(
          !directiveIntrospection.onField ? [] : [DirectiveLocation.FIELD],
          !directiveIntrospection.onOperation
            ? []
            : [
                DirectiveLocation.QUERY,
                DirectiveLocation.MUTATION,
                DirectiveLocation.SUBSCRIPTION,
              ],
          !directiveIntrospection.onFragment
            ? []
            : [
                DirectiveLocation.FRAGMENT_DEFINITION,
                DirectiveLocation.FRAGMENT_SPREAD,
                DirectiveLocation.INLINE_FRAGMENT,
              ]
        );
    if (!directiveIntrospection.args) {
      throw new Error(
        'Introspection result missing directive args: ' +
          JSON.stringify(directiveIntrospection)
      );
    }
    return new GraphQLDirective({
      name: directiveIntrospection.name,
      description: directiveIntrospection.description,
      locations,
      args: buildInputValueDefMap(directiveIntrospection.args),
    });
  }

  // Iterate through all types, getting the type definition for each, ensuring
  // that any type not directly referenced by a field will get created.
  const types = schemaIntrospection.types.map((typeIntrospection) =>
    getNamedType(typeIntrospection.name)
  );

  // Get the root Query, Mutation, and Subscription types.
  const queryType = schemaIntrospection.queryType
    ? getObjectType(schemaIntrospection.queryType)
    : null;

  const mutationType = schemaIntrospection.mutationType
    ? getObjectType(schemaIntrospection.mutationType)
    : null;

  const subscriptionType = schemaIntrospection.subscriptionType
    ? getObjectType(schemaIntrospection.subscriptionType)
    : null;

  // Get the directives supported by Introspection, assuming empty-set if
  // directives were not queried for.
  const directives = schemaIntrospection.directives
    ? schemaIntrospection.directives.map(buildDirective)
    : [];

  // Then produce and return a Schema with these types.
  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
    subscription: subscriptionType,
    types,
    directives,
    assumeValid: options && options.assumeValid,
    allowedLegacyNames: options && options.allowedLegacyNames,
  } as unknown as GraphQLSchemaConfig);
}
