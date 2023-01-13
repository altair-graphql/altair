import Fuse from 'fuse.js';
import { GraphQLSchema } from 'graphql/type/schema';
import { DocumentIndexEntry, DocumentIndexFieldEntry } from './models';
import { buildSchema } from 'graphql/utilities';
import getRootTypes from '../../utils/get-root-types';
import { GraphQLObjectType, GraphQLFieldMap, GraphQLType } from 'graphql';
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

    this.searchIndex = searchIndex;
    return searchIndex;
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

    Object.entries(fields).forEach(([fieldKey, field]) => {
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
    return name.replace(/[\[\]!]/g, '');
  }
}
