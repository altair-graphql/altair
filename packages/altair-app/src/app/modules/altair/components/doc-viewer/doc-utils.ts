import Fuse from 'fuse.js';
import { GraphQLSchema } from 'graphql/type/schema';
import {
  DocumentIndexEntry,
  DocumentIndexFieldEntry,
  DocumentIndexDirectiveEntry,
  RelatedOperation,
  ParentTypeInfo,
} from './models';
import { buildSchema } from 'graphql/utilities';
import getRootTypes from '../../utils/get-root-types';
import {
  GraphQLObjectType,
  GraphQLFieldMap,
  GraphQLType,
  GraphQLDirective,
} from 'graphql';
import { generateQuery } from '../../services/gql/generateQuery';

export class DocUtils {
  schema?: GraphQLSchema;
  searchIndex: DocumentIndexEntry[] = [];

  constructor(sdl?: string) {
    if (sdl) {
      this.updateSchema(sdl);
    }
  }

  updateSchema(sdl: string) {
    this.schema = buildSchema(sdl);
  }

  /**
   * Generate the search index from the schema
   * @param schema
   */
  generateSearchIndex() {
    if (!this.schema) {
      return [];
    }

    let searchIndex: DocumentIndexEntry[] = [];

    const rootTypes = getRootTypes(this.schema);

    // Store the indices of all the types and fields
    rootTypes.forEach((type) => {
      searchIndex = [
        ...searchIndex,
        ...this.getTypeIndices(type, true, searchIndex),
      ];
    });

    // Get types from typeMap into index as well, excluding the __
    const schemaTypeMap = this.schema.getTypeMap();
    Object.keys(schemaTypeMap).forEach((key) => {
      if (!/^__/.test(key)) {
        searchIndex = [
          ...searchIndex,
          ...this.getTypeIndices(
            schemaTypeMap[key] as GraphQLObjectType,
            false,
            searchIndex
          ),
        ];
      }
    });

    // Get directives into index as well
    const directives = this.schema.getDirectives();
    searchIndex = [...searchIndex, ...this.getDirectivesIndices(directives)];

    this.searchIndex = searchIndex;
    return searchIndex;
  }

  /**
   * Gets the indices for directives
   */
  getDirectivesIndices(
    directives: readonly GraphQLDirective[]
  ): DocumentIndexEntry[] {
    let index: DocumentIndexEntry[] = [];

    directives.forEach((directive) => {
      // For each directive, create an entry in the index
      const directiveIndex: DocumentIndexDirectiveEntry = {
        search: directive.name,
        name: '@' + directive.name,
        description: directive.description || '',
        cat: 'directive',
        highlight: 'directive',
        locations: directive.locations,
        args: directive.args?.map((arg) => ({
          name: arg.name,
          description: arg.description ?? '',
        })),
      };
      index = [...index, directiveIndex];

      // For each argument of the directive, create an entry in the index for the directive,
      // searchable by the argument name
      if (directive.args && directive.args.length) {
        directive.args.forEach((arg) => {
          index = [
            ...index,
            {
              ...directiveIndex,
              search: arg.name,
              highlight: 'argument',
            },
          ];
        });
      }
    });

    return index;
  }

  /**
   * Gets the indices for fields
   */
  getFieldsIndices(
    fields: GraphQLFieldMap<any, any>,
    type: GraphQLType,
    isQuery: boolean,
    curIndexStack: DocumentIndexEntry[]
  ): DocumentIndexEntry[] {
    let index: DocumentIndexEntry[] = [];

    Object.entries(fields).forEach(([, field]) => {
      // For each field, create an entry in the index
      const fieldIndex: DocumentIndexFieldEntry = {
        search: field.name,
        name: field.name,
        description: field.description ? field.description : '',
        // We cannot use the GraphQLArgument objects directly since
        //  those can't be cloned using the structured cloning algorithm when
        // sent to the worker. So we just use the required fields
        args: field.args?.map((arg) => ({
          name: arg.name,
          description: arg.description ?? '',
        })),
        cat: 'field',
        type: (type as GraphQLObjectType).name,
        isQuery,
        highlight: 'field',
      };
      index = [...index, fieldIndex];

      // For each argument of the field, create an entry in the index for the field,
      // searchable by the argument name
      if (field.args && field.args.length) {
        field.args.forEach((arg) => {
          index = [
            ...index,
            {
              ...fieldIndex,
              search: arg.name,
              highlight: 'argument',
            },
          ];
        });
      }

      // If the field has a type, get indices for the type as well
      if (field.type) {
        index = [
          ...index,
          ...this.getTypeIndices(field.type as GraphQLObjectType, false, [
            ...curIndexStack,
            ...index,
          ]).filter((val) => !!val),
        ];
      }
    });

    return index;
  }

  /**
   * Gets the indices for types
   * @param  {object} type the type object
   * @param  {boolean} isRoot specifies if the type is a root level type
   * @param  {array} curIndexStack contains all the currently mapped indices in the stack
   * @return {array}            the indices for the given type
   */
  getTypeIndices(
    type: GraphQLObjectType,
    isRoot: boolean,
    curIndexStack: DocumentIndexEntry[]
  ): DocumentIndexEntry[] {
    let fields: GraphQLFieldMap<any, any> | undefined;

    // If a type does not have a name, don't process it
    if (!(type as GraphQLObjectType).name) {
      return [];
    }

    // If any type is already in the index, then don't process the type again
    if (curIndexStack.some((x) => x.name === type.name && x.cat === 'type')) {
      return [];
    }

    if (type.getFields) {
      fields = type.getFields();
    }

    const _index: DocumentIndexEntry[] = [
      {
        search: type.name,
        name: type.name,
        cat: 'type',
        description: type.description ? type.description : '',
        isRoot,
        highlight: 'type',
      },
    ];

    if (fields) {
      return [
        ..._index,
        ...this.getFieldsIndices(fields, type, isRoot, [
          ...curIndexStack,
          ..._index,
        ]).filter((val) => !!val),
      ];
    }

    return _index;
  }

  /**
   * search through the docs for the provided term
   */
  searchDocs(term: string): DocumentIndexEntry[] {
    if (!this.searchIndex.length) {
      return [];
    }
    const fuse = new Fuse(this.searchIndex, {
      keys: ['search'],
      threshold: 0.4,
    });

    return fuse.search(term).map((res) => res.item);

    // return this.searchIndex.filter(item => new RegExp(term as string, 'i').test(item.search));
  }

  /**
   * Generate the query for the specified field
   * @param field name of the current field
   * @param parentType parent type of the current field
   * @param parentFields preceding parent field and type combinations
   */
  async generateQueryV2(
    field: string,
    parentType: string,
    opts: { tabSize: number; addQueryDepthLimit: number }
  ) {
    if (!this.schema) {
      return;
    }
    const res = await generateQuery(this.schema, field, parentType, {
      maxDepth: opts.addQueryDepthLimit,
      tabSize: opts.tabSize,
    });

    return {
      query: res.generated,
      meta: res.metas.find((_) => _.hasArgs) || {},
    };
  }

  /**
   * Cleans out getType() names to contain only the type name itself
   * @param name
   */
  cleanName(name: string) {
    return name.replace(/[[\]!]/g, '');
  }

  /**
   * Check if a type is a built-in scalar type
   */
  private isBuiltInScalarType(typeName: string): boolean {
    const builtInScalars = ['String', 'Int', 'Float', 'Boolean', 'ID'];
    return builtInScalars.includes(typeName);
  }

  /**
   * Get operations (query/mutation/subscription fields) that use this type
   * Uses the search index for performance instead of traversing the schema
   */
  getRelatedOperations(typeName: string): RelatedOperation[] {
    // Skip built-in scalar types as they are used everywhere
    if (this.isBuiltInScalarType(typeName)) {
      return [];
    }

    if (!this.schema || !this.searchIndex.length) {
      return [];
    }

    const operations: RelatedOperation[] = [];
    // Track operations we've already added to avoid duplicates
    // Key format: "name|parentType|category"
    const addedOperations = new Set<string>();

    // Get root types
    const queryType = this.schema.getQueryType();
    const mutationType = this.schema.getMutationType();
    const subscriptionType = this.schema.getSubscriptionType();

    // Find fields in the index that belong to root types and use our type
    this.searchIndex.forEach((entry) => {
      if (entry.cat === 'field' && entry.type) {
        const parentTypeName = entry.type;
        let category: 'query' | 'mutation' | 'subscription' | null = null;

        // Determine if this is a root operation
        if (queryType && parentTypeName === queryType.name) {
          category = 'query';
        } else if (mutationType && parentTypeName === mutationType.name) {
          category = 'mutation';
        } else if (subscriptionType && parentTypeName === subscriptionType.name) {
          category = 'subscription';
        }

        if (category && this.schema) {
          // Check if this field uses our type
          const parentType = this.schema.getType(parentTypeName);
          if (parentType && 'getFields' in parentType) {
            const fields = parentType.getFields();
            const field = fields[entry.name];
            if (field && this.fieldUsesType(field, typeName)) {
              // Create a unique key for this operation
              const operationKey = `${entry.name}|${parentTypeName}|${category}`;
              
              // Only add if we haven't seen this operation before
              if (!addedOperations.has(operationKey)) {
                addedOperations.add(operationKey);
                operations.push({
                  name: entry.name,
                  parentType: parentTypeName,
                  category,
                  description: entry.description || '',
                });
              }
            }
          }
        }
      }
    });

    return operations;
  }

  /**
   * Get all types that have fields of this type (parent types)
   * Uses the search index for performance instead of traversing the schema
   */
  getParentTypes(typeName: string): ParentTypeInfo[] {
    // Skip built-in scalar types as they are used everywhere
    if (this.isBuiltInScalarType(typeName)) {
      return [];
    }

    if (!this.schema || !this.searchIndex.length) {
      return [];
    }

    const parentTypesMap = new Map<string, ParentTypeInfo>();

    // Get root type names to skip them
    const queryType = this.schema.getQueryType();
    const mutationType = this.schema.getMutationType();
    const subscriptionType = this.schema.getSubscriptionType();
    const rootTypeNames = [
      queryType?.name,
      mutationType?.name,
      subscriptionType?.name,
    ].filter(Boolean) as string[];

    // Find fields in the index that use our type
    this.searchIndex.forEach((entry) => {
      if (entry.cat === 'field' && entry.type) {
        const parentTypeName = entry.type;

        // Skip root types (they are already in operations)
        if (rootTypeNames.includes(parentTypeName)) {
          return;
        }

        // Check if this field uses our type
        if (!this.schema) {
          return;
        }
        const parentType = this.schema.getType(parentTypeName);
        if (parentType && 'getFields' in parentType) {
          const fields = parentType.getFields();
          const field = fields[entry.name];
          if (field && this.fieldUsesType(field, typeName)) {
            // Add or update the parent type in our map
            const existing = parentTypesMap.get(parentTypeName);
            if (existing) {
              existing.fieldCount++;
            } else {
              // Find the type entry in the index for description
              const typeEntry = this.searchIndex.find(
                (e) => e.cat === 'type' && e.name === parentTypeName
              );
              parentTypesMap.set(parentTypeName, {
                name: parentTypeName,
                description: typeEntry?.description || '',
                fieldCount: 1,
              });
            }
          }
        }
      }
    });

    return Array.from(parentTypesMap.values());
  }

  /**
   * Check if a field uses the given type (as return type or argument type)
   */
  private fieldUsesType(field: any, typeName: string): boolean {
    // Check return type
    if (this.getBaseTypeName(field.type) === typeName) {
      return true;
    }

    // Check argument types
    if (field.args) {
      for (const arg of field.args) {
        if (this.getBaseTypeName(arg.type) === typeName) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get the base type name from a GraphQL type (unwrapping NonNull and List)
   */
  private getBaseTypeName(type: any): string {
    let currentType = type;
    while (currentType.ofType) {
      currentType = currentType.ofType;
    }
    return currentType.name || '';
  }
}
