import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostBinding,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AltairConfig } from '../../../config';
import { debug } from 'app/utils/logger';
import { DomSanitizer } from '@angular/platform-browser';
import * as fromDocs from '../../../reducers/docs/docs';

import { untilDestroyed } from 'ngx-take-until-destroy';
import {
  GraphQLType,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLArgument,
  GraphQLFieldMap
} from 'graphql';
import { DocumentIndexEntry } from '../models';
import { fadeInOutAnimationTrigger } from 'app/animations';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInOutAnimationTrigger,
  ]
  // styleUrls: ['./doc-viewer.component.scss']
})
export class DocViewerComponent implements OnChanges, OnDestroy {

  @Input() gqlSchema: GraphQLSchema;
  @Input() allowIntrospection = true;
  @Input() isLoading = false;
  @Input() addQueryDepthLimit = this.altairConfig.add_query_depth_limit;
  @Input() tabSize = this.altairConfig.tab_size;
  @Input() docView: fromDocs.DocView = {
    view: 'root', // type, field, root, search
    parentType: 'Query', // used by field views
    name: 'Conference' // identifies type/field
  };
  @Input() lastUpdatedAt: number;

  @Output() toggleDocsChange = new EventEmitter();
  @Output() setDocViewChange = new EventEmitter<Partial<fromDocs.DocView>>();
  @Output() addQueryToEditorChange = new EventEmitter();
  @Output() exportSDLChange = new EventEmitter();
  @Output() loadSchemaChange = new EventEmitter();

  @HostBinding('style.flex-grow') public resizeFactor: number;

  rootTypes: GraphQLObjectType[] = [];
  index: DocumentIndexEntry[] = [];

  searchInputPlaceholder = 'Search docs...';

  // Used to determine if index related actions (like search, add query, etc.)
  // should be available
  hasSearchIndex = false;

  docHistory: fromDocs.DocView[] = [];

  searchResult: DocumentIndexEntry[] = [];
  searchTerm = '';

  constructor(
    private translate: TranslateService,
    private _sanitizer: DomSanitizer,
    private altairConfig: AltairConfig,
  ) {

    // Set translations
    this.translate.get('DOCS_SEARCH_INPUT_PLACEHOLDER_TEXT')
    .pipe(untilDestroyed(this))
    .subscribe(text => this.searchInputPlaceholder = text);
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes.gqlSchema && changes.gqlSchema.currentValue) {
      // const schema = changes.gqlSchema.currentValue;
      this.gqlSchema = changes.gqlSchema.currentValue;
      this.updateDocs(changes.gqlSchema.currentValue);
    }
  }

  updateDocs(schema: GraphQLSchema) {
    debug.log(schema);
    this.rootTypes = [
      schema.getQueryType(),
      schema.getMutationType(),
      schema.getSubscriptionType()
    ].filter(Boolean) as GraphQLObjectType[];

    try {
      this.generateIndex(schema);
      this.hasSearchIndex = true;
    } catch (err) {
      debug.log('Error while generating index.', err);
      this.hasSearchIndex = false;
    }
  }

  /**
   * Generate the search index from the schema
   * @param schema
   */
  generateIndex(schema: GraphQLSchema) {
    let getFieldsIndices: (
      fields: GraphQLFieldMap<any, any>,
      type: GraphQLType,
      isQuery: Boolean,
      curIndexStack: DocumentIndexEntry[]
    ) => DocumentIndexEntry[];
    let getTypeIndices: (type: GraphQLObjectType, isRoot: boolean, curIndexStack: DocumentIndexEntry[]) => DocumentIndexEntry[];

    /**
     * Gets the indices for fields
     */
    getFieldsIndices = (fields, type, isQuery: boolean, curIndexStack) => {
      let index: DocumentIndexEntry[] = [];

      Object.keys(fields).forEach((fieldKey: any) => {
        const field = fields[fieldKey];

        // For each field, create an entry in the index
        const fieldIndex = {
          search: field.name,
          name: field.name,
          description: field.description ? field.description : '',
          args: field.args,
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
            ...getTypeIndices((field.type as GraphQLObjectType), false, [...curIndexStack, ...index]).filter(val => !!val),
          ];
        }

      });

      return index;
    };

    /**
     * Gets the indices for types
     * @param  {object} type the type object
     * @param  {boolean} isRoot specifies if the type is a root level type
     * @param  {array} curIndexStack contains all the currently mapped indices in the stack
     * @return {array}            the indices for the given type
     */
    getTypeIndices = (type, isRoot, curIndexStack) => {
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

      const index = [
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
          ...index,
          ...getFieldsIndices(fields, type, isRoot, [ ...curIndexStack, ...index ]).filter(val => !!val)];
      }

      return index;
    };

    this.index = [];

    // Store the indices of all the types and fields
    this.rootTypes.forEach(type => {
      this.index = [...this.index, ...getTypeIndices(type, true, this.index)];
    });

    // Get types from typeMap into index as well, excluding the __
    const schemaTypeMap = schema.getTypeMap();
    Object.keys(schemaTypeMap).forEach(key => {
      if (!/^__/.test(key)) {
        this.index = [...this.index, ...getTypeIndices(schemaTypeMap[key] as GraphQLObjectType, false, this.index)];
      }
    });

    debug.log('Index: ', this.index);
  }

  autocompleteSource = (term: string) => of(this.index.filter(item => new RegExp(term, 'i').test(item.search)));
  autocompleteListFormatter = (data: DocumentIndexEntry) => {
    const html = `
      <div class='doc-viewer-autocomplete-item'>
        ${data.search}
        <span class='doc-viewer-autocomplete-item-field'>${data.cat}</span>
        <span class='doc-viewer-autocomplete-item-description'>${data.description}</span>
      </div>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  };

  searchInputKeyUp(term: string, e: KeyboardEvent) {
    if (e && e.keyCode !== 13) {
      return;
    }

    this.searchDocs(term);
  }

  /**
   * search through the docs for the provided term
   */
  searchDocs(term: string | { name: string }) {
    if (typeof term !== 'string') {
      term = term.name;
    }

    if (!this.hasSearchIndex) {
      return false;
    }
    this.updateDocHistory();
    this.setDocViewChange.next({ view: 'search' });
    this.searchResult = this.index.filter(item => new RegExp(term as string, 'i').test(item.search));
    debug.log(this.searchResult);
  }

  /**
   * Cleans out getType() names to contain only the type name itself
   * @param name
   */
  cleanName(name: string) {
    return name.replace(/[\[\]!]/g, '');
  }

  /**
   * Go back through the doc history
   */
  goBack() {
    if (this.docHistory.length) {
      this.setDocViewChange.next(this.docHistory.pop());
    }
  }

  /**
   * Go back to root view
   */
  goHome() {
    this.setDocViewChange.next({ view: 'root' });
    this.docHistory = [];
  }

  /**
   * Update the doc history with the current view
   */
  updateDocHistory() {
    if (this.docView && this.docView.view !== 'search') {
      this.docHistory.push({ ...this.docView });
    }
  }

  /**
   * Updates the doc view for a particular type
   * @param name name of type
   */
  goToType(name: string) {
    this.updateDocHistory();
    this.setDocViewChange.next({ view: 'type', name: name.replace(/[\[\]!]/g, '') });
  }

  /**
   * Updates the doc view for a particular field
   * @param name name of field
   * @param parentType name of parent type of field
   */
  goToField(name: string, parentType: string) {
    this.updateDocHistory();
    this.setDocViewChange.next({ view: 'field', name: name.replace(/[\[\]!]/g, ''), parentType: parentType.replace(/[\[\]!]/g, '') });
  }

  /**
   * Generate the query for the specified field
   * @param name name of the current field
   * @param parentType parent type of the current field
   * @param parentFields preceding parent field and type combinations
   */
  generateQuery(name: string, parentType: string) {
    let query = '';
    let hasArgs = false;

    if (!this.gqlSchema) {
      return;
    }

    // Add the root type of the query
    switch (parentType) {
      case this.gqlSchema.getQueryType() && this.gqlSchema.getQueryType()!.name:
        query += 'query';
        break;
      case this.gqlSchema.getMutationType() && this.gqlSchema.getMutationType()!.name:
        query += 'mutation';
        break;
      case this.gqlSchema.getSubscriptionType() && this.gqlSchema.getSubscriptionType()!.name:
        query += 'subscription';
        break;
      default:
        query += `fragment _____ on ${parentType}`;
        hasArgs = true;
    }

    const fieldData = this.generateFieldData(name, parentType, [], 1);

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
    level: number
  ): { query: string, meta: { hasArgs?: boolean } } {

    if (!name || !parentType || !parentFields) {
      return { query: '', meta: {} };
    }
    const tabSize = this.tabSize || 2;
    const parentTypeObject = this.gqlSchema.getType(parentType) as GraphQLObjectType | undefined;
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
    const curType = this.gqlSchema.getType(curTypeName) as GraphQLObjectType | undefined;

    // Don't add a field if it has been added in the query already.
    // This happens when there is a recursive field
    if (parentFields.filter(x => x.type === curTypeName).length) {
      return { query: '', meta: {} };
    }

    // Stop adding new fields once the specified level depth limit is reached
    if (level >= this.addQueryDepthLimit) {
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

        const curInnerFieldData = this.generateFieldData(cur, curTypeName, [...parentFields, { name, type: curTypeName }], level + 1);
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

  addToEditor(name: string, parentType: string) {
    if (!this.hasSearchIndex) {
      return false;
    }
    const generatedQuery = this.generateQuery(name, parentType);
    if (generatedQuery) {
      this.addQueryToEditorChange.next(generatedQuery);
    }
  }

  exportSDL() {
    this.exportSDLChange.next();
  }

  onResize(resizeFactor: number) {
    this.resizeFactor = resizeFactor;
  }

  rootTypeTrackBy(index: number, type: GraphQLObjectType) {
    return type.name;
  }

  ngOnDestroy() {
  }
}
