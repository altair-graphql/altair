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
import { RelatedOperation, ParentTypeInfo } from '../models';

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
  readonly relatedOperations = input<RelatedOperation[]>([]);
  readonly parentTypes = input<ParentTypeInfo[]>([]);

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
}
