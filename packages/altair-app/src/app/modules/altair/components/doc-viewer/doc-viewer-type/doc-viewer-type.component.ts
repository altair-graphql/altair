import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  GraphQLArgument,
  GraphQLField,
  GraphQLNamedType,
  GraphQLUnionType,
  GraphQLEnumType,
  isUnionType,
  isInterfaceType,
} from 'graphql';

@Component({
  selector: 'app-doc-viewer-type',
  templateUrl: './doc-viewer-type.component.html',
  styleUrls: ['./doc-viewer-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocViewerTypeComponent {
  readonly data = input<GraphQLNamedType>();
  readonly gqlSchema = input<GraphQLSchema>();
  readonly sortByOption = input<SortByOptions>('none');
  readonly hideDeprecatedDocItems = input<boolean>(false);

  readonly goToFieldChange = output<{
    name: string;
    parentType: string;
  }>();
  readonly goToTypeChange = output<{
    name: string;
  }>();
  readonly addToEditorChange = output<{
    name: string;
    parentType: string;
  }>();
  readonly sortFieldsByChange = output<SortByOptions>();

  /**
   * Check if the current type is a root type
   * @param type
   */
  isRootType(type: string) {
    const gqlSchema = this.gqlSchema();
    if (!type || !gqlSchema) {
      return false;
    }

    switch (type) {
      case gqlSchema.getQueryType() && gqlSchema.getQueryType()!.name:
      case gqlSchema.getMutationType() && gqlSchema.getMutationType()!.name:
      case gqlSchema.getSubscriptionType() && gqlSchema.getSubscriptionType()!.name:
        return true;
    }

    return false;
  }

  goToField(name: string, parentType: string) {
    this.goToFieldChange.emit({ name, parentType });
  }

  goToType(name: string) {
    this.goToTypeChange.emit({ name });
  }

  addToEditor(name: string, parentType: string) {
    this.addToEditorChange.emit({ name, parentType });
  }

  // TODO: Move to service
  isGraphQLInterface(type: GraphQLType): type is GraphQLInterfaceType {
    return type instanceof GraphQLInterfaceType;
  }
  isGraphQLUnion(type: GraphQLType): type is GraphQLUnionType {
    return type instanceof GraphQLUnionType;
  }
  isGraphQLObject(type: GraphQLType): type is GraphQLObjectType {
    return type instanceof GraphQLObjectType;
  }
  /**
   * Returns an array of all the types that implement the provided type (interface)
   * @param type
   */
  getTypeImplementations(type: GraphQLType) {
    if (isInterfaceType(type)) {
      return this.gqlSchema()?.getPossibleTypes(type) || [];
    }
    return [];
  }
  /**
   * Returns an array of all the interfaces implemented by type
   * @param type
   */
  getTypeImplements(type: GraphQLType) {
    if (this.isGraphQLObject(type)) {
      return type.getInterfaces() || [];
    }
    return [];
  }

  getTypeEnumValues(type: GraphQLType) {
    if (type instanceof GraphQLEnumType) {
      return type.getValues();
    }

    return [];
  }

  getSubtypes(type: GraphQLType) {
    if (isUnionType(type)) {
      return type.getTypes();
    }

    return [];
  }

  getTypeFields(type: GraphQLType) {
    if ('getFields' in type) {
      return Object.values(type.getFields());
    }

    return [];
  }

  schemaItemTrackBy<T extends { name: string }>(index: number, schemaItem: T) {
    return schemaItem.name;
  }

  getDefaultValue(arg: GraphQLArgument) {
    if (typeof arg.defaultValue !== 'undefined') {
      return JSON.stringify(arg.defaultValue);
    }
    return;
  }

  setSortBy(v: SortByOptions) {
    this.sortFieldsByChange.emit(v);
  }

  sortFieldsTransformer(
    fields: GraphQLField<any, any>[],
    sortByOption: SortByOptions
  ) {
    switch (sortByOption) {
      case 'a-z':
        return fields.sort((a, b) => {
          const aName = a.name.toLowerCase() || '';
          const bName = b.name.toLowerCase() || '';

          if (aName > bName) {
            return 1;
          }
          if (aName < bName) {
            return -1;
          }
          return 0;
        });
      case 'z-a':
        return fields.sort((a, b) => {
          const aName = a.name.toLowerCase() || '';
          const bName = b.name.toLowerCase() || '';

          if (aName > bName) {
            return -1;
          }
          if (aName < bName) {
            return 1;
          }
          return 0;
        });
    }
    return fields;
  }

  /**
   * Get operations (query/mutation/subscription fields) that return or use this type
   */
  getRelatedOperations(type: GraphQLType) {
    const gqlSchema = this.gqlSchema();
    if (!gqlSchema) {
      return [];
    }

    const typeName = this.getTypeName(type);
    const operations: Array<{
      field: GraphQLField<any, any>;
      parentType: GraphQLObjectType;
      category: 'query' | 'mutation' | 'subscription';
    }> = [];

    // Check Query type
    const queryType = gqlSchema.getQueryType();
    if (queryType) {
      const queryFields = Object.values(queryType.getFields());
      queryFields.forEach((field) => {
        if (this.fieldUsesType(field, typeName)) {
          operations.push({
            field,
            parentType: queryType,
            category: 'query',
          });
        }
      });
    }

    // Check Mutation type
    const mutationType = gqlSchema.getMutationType();
    if (mutationType) {
      const mutationFields = Object.values(mutationType.getFields());
      mutationFields.forEach((field) => {
        if (this.fieldUsesType(field, typeName)) {
          operations.push({
            field,
            parentType: mutationType,
            category: 'mutation',
          });
        }
      });
    }

    // Check Subscription type
    const subscriptionType = gqlSchema.getSubscriptionType();
    if (subscriptionType) {
      const subscriptionFields = Object.values(subscriptionType.getFields());
      subscriptionFields.forEach((field) => {
        if (this.fieldUsesType(field, typeName)) {
          operations.push({
            field,
            parentType: subscriptionType,
            category: 'subscription',
          });
        }
      });
    }

    return operations;
  }

  /**
   * Get all types that have fields of this type (parent types)
   */
  getParentTypes(type: GraphQLType) {
    const gqlSchema = this.gqlSchema();
    if (!gqlSchema) {
      return [];
    }

    const typeName = this.getTypeName(type);
    const parentTypes: Array<{
      type: GraphQLNamedType;
      fields: GraphQLField<any, any>[];
    }> = [];

    const typeMap = gqlSchema.getTypeMap();
    Object.keys(typeMap).forEach((key) => {
      // Skip internal types and root types
      if (!/^__/.test(key)) {
        const currentType = typeMap[key];
        if (currentType && (this.isGraphQLObject(currentType) || this.isGraphQLInterface(currentType))) {
          const fields = Object.values(currentType.getFields());
          const fieldsUsingType = fields.filter((field) =>
            this.fieldUsesType(field, typeName)
          );

          if (fieldsUsingType.length > 0) {
            // Skip if it's a root type (already shown in operations)
            const isRoot =
              currentType === gqlSchema.getQueryType() ||
              currentType === gqlSchema.getMutationType() ||
              currentType === gqlSchema.getSubscriptionType();

            if (!isRoot) {
              parentTypes.push({
                type: currentType,
                fields: fieldsUsingType,
              });
            }
          }
        }
      }
    });

    return parentTypes;
  }

  /**
   * Check if a field uses the given type (as return type or argument type)
   */
  private fieldUsesType(field: GraphQLField<any, any>, typeName: string): boolean {
    // Check return type
    if (this.getTypeName(field.type) === typeName) {
      return true;
    }

    // Check argument types
    if (field.args) {
      for (const arg of field.args) {
        if (this.getTypeName(arg.type) === typeName) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get the base type name from a GraphQL type (unwrapping NonNull and List)
   */
  private getTypeName(type: GraphQLType): string {
    let currentType: any = type;
    while (currentType.ofType) {
      currentType = currentType.ofType;
    }
    return currentType.name;
  }
}
