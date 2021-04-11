import Fuse from 'fuse.js';
import { GraphQLSchema } from 'graphql/type/schema';
import { DocumentIndexEntry } from './models';
import { buildSchema } from 'graphql/utilities';
import getRootTypes from '../../utils/get-root-types';
import { GraphQLObjectType, GraphQLFieldMap, GraphQLType } from 'graphql';

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
    rootTypes.forEach(type => {
      searchIndex = [...searchIndex, ...this.getTypeIndices(type, true, searchIndex)];
    });

    // Get types from typeMap into index as well, excluding the __
    const schemaTypeMap = this.schema.getTypeMap();
    Object.keys(schemaTypeMap).forEach(key => {
      if (!/^__/.test(key)) {
        searchIndex = [...searchIndex, ...this.getTypeIndices(schemaTypeMap[key] as GraphQLObjectType, false, searchIndex)];
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

    Object.keys(fields).forEach((fieldKey: any) => {
      const field = fields[fieldKey];

      // For each field, create an entry in the index
      const fieldIndex = {
        search: field.name,
        name: field.name,
        description: field.description ? field.description : '',
        args: field.args ? field.args.map(arg => ({ name: arg.name, description: arg.description })) : [],
        cat: 'field',
        type: (type as GraphQLObjectType).name,
        isQuery,
        highlight: 'field'
      };
      index = [ ...index, fieldIndex ];

      // For each argument of the field, create an entry in the index for the field,
      // searchable by the argument name
      if (field.args && field.args.length) {
        field.args.forEach(arg => {
          index = [...index, {
            ...fieldIndex,
            search: arg.name,
            highlight: 'argument'
          }];
        });
      }

      // If the field has a type, get indices for the type as well
      if (field.type) {
        index = [
          ...index,
          ...this.getTypeIndices((field.type as GraphQLObjectType), false, [...curIndexStack, ...index]).filter(val => !!val),
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
  getTypeIndices(type: GraphQLObjectType, isRoot: boolean, curIndexStack: DocumentIndexEntry[]): DocumentIndexEntry[] {
    let fields = null;

    // If a type does not have a name, don't process it
    if (!(type as GraphQLObjectType).name) {
      return [];
    }

    // If any type is already in the index, then don't process the type again
    if (curIndexStack.some(x => x.name === type.name && x.cat === 'type')) {
      return [];
    }

    if (type.getFields) {
      fields = type.getFields();
    }

    const _index = [
      {
        search: type.name,
        name: type.name,
        cat: 'type',
        description: type.description ? type.description : '',
        isRoot,
        highlight: 'type'
      }
    ];

    if (fields) {
      return [
        ..._index,
        ...this.getFieldsIndices(fields, type, isRoot, [ ...curIndexStack, ..._index ]).filter(val => !!val)];
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
      keys: [ 'search' ],
      threshold: .4,
    });

    return fuse.search(term).map(res => res.item);

    // return this.searchIndex.filter(item => new RegExp(term as string, 'i').test(item.search));
  }


  /**
   * Generate the query for the specified field
   * @param name name of the current field
   * @param parentType parent type of the current field
   * @param parentFields preceding parent field and type combinations
   */
  generateQuery(name: string, parentType: string, opts: any) {
    let query = '';
    let hasArgs = false;

    if (!this.schema) {
      return;
    }

    // Add the root type of the query
    switch (parentType) {
      case this.schema.getQueryType() && this.schema.getQueryType()!.name:
        query += 'query';
        break;
      case this.schema.getMutationType() && this.schema.getMutationType()!.name:
        query += 'mutation';
        break;
      case this.schema.getSubscriptionType() && this.schema.getSubscriptionType()!.name:
        query += 'subscription';
        break;
      default:
        query += `fragment _____ on ${parentType}`;
        hasArgs = true;
    }

    const fieldData = this.generateFieldData(name, parentType, [], 1, opts);

    if (!fieldData) {
      return;
    }

    // Add the query fields
    query += `{\n${fieldData.query}\n}`;

    const meta = { ...fieldData.meta };

    // Update hasArgs option
    meta.hasArgs = hasArgs || meta.hasArgs;

    return { query, meta };
  }

  /**
   * Cleans out getType() names to contain only the type name itself
   * @param name
   */
  cleanName(name: string) {
    return name.replace(/[\[\]!]/g, '');
  }

  /**
   * Generate the query for the specified field
   * @param name name of the current field
   * @param parentType parent type of the current field
   * @param parentFields preceding parent field and type combinations
   * @param level current depth level of the current field
   */
  private generateFieldData(
    name: string,
    parentType: string,
    parentFields: { name: string, type: string }[],
    level: number,
    opts: { tabSize?: number, addQueryDepthLimit?: number } = {},
  ): { query: string, meta: { hasArgs?: boolean } } {

    if (!name || !parentType || !parentFields || !this.schema) {
      return { query: '', meta: {} };
    }
    const tabSize = opts.tabSize || 2;
    const parentTypeObject = this.schema.getType(parentType) as GraphQLObjectType | undefined;
    const field = parentTypeObject && parentTypeObject.getFields()[name];

    if (!field) {
      return { query: '', meta: {} };
    }
    const meta = {
      hasArgs: false
    };

    // Start the query with the field name
    let fieldStr: string = ' '.repeat(level * tabSize) + field.name;

    // If the field has arguments, add them
    if (field.args && field.args.length) {
      meta.hasArgs = true;

      const argsList = field.args.reduce((acc, cur) => {
        return acc + ', ' + cur.name + ': ______';
      }, '').substring(2);

      fieldStr += `(${argsList})`;
    }

    // Retrieve the current field type
    const curTypeName = this.cleanName(field.type.inspect());
    const curType = this.schema.getType(curTypeName) as GraphQLObjectType | undefined;

    // Don't add a field if it has been added in the query already.
    // This happens when there is a recursive field
    if (parentFields.filter(x => x.type === curTypeName).length) {
      return { query: '', meta: {} };
    }

    // Stop adding new fields once the specified level depth limit is reached
    if (level >= (opts.addQueryDepthLimit || 0)) {
      return { query: '', meta: {} };
    }

    // Get all the fields of the field type, if available
    const innerFields = curType && curType.getFields && curType.getFields();
    let innerFieldsData = '';
    if (innerFields) {
      innerFieldsData = Object.keys(innerFields).reduce((acc, cur) => {
        // Don't add a field if it has been added in the query already.
        // This happens when there is a recursive field
        if (parentFields.filter(x => x.name === cur && x.type === curTypeName).length) {
          return '';
        }

        const curInnerFieldData = this.generateFieldData(cur, curTypeName, [...parentFields, { name, type: curTypeName }], level + 1, opts);
        if (!curInnerFieldData) {
          return acc;
        }

        const curInnerFieldStr: String = curInnerFieldData.query;

        // Set the hasArgs meta if the inner field has args
        meta.hasArgs = meta.hasArgs || curInnerFieldData.meta.hasArgs || false;

        // Don't bother adding the field if there was nothing generated.
        // This should fix the empty line issue in the inserted queries
        if (!curInnerFieldStr) {
          return acc;
        }

        // Join all the fields together
        return acc + '\n' + curInnerFieldStr;
      }, '').substring(1);
    }

    // Add the inner fields with braces if available
    if (innerFieldsData) {
      fieldStr += `{\n${innerFieldsData}\n`;
      fieldStr += ' '.repeat(level * tabSize) + `}`;
    }

    return { query: fieldStr, meta };
  }
}
