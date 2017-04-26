import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  // styleUrls: ['./doc-viewer.component.scss']
})
export class DocViewerComponent implements OnChanges {

  @Input() gqlSchema = null;

  docsData = {
    rootTypes: [],
    queries: {},
    mutations: {},
    types: []
  };

  // currentDocView = {
  //   section: 'queryDetail',
  //   parentName: 'mutations',
  //   itemName: 'registerCustomer'
  // };
  currentDocView = {
    section: 'rootTypes',
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes.gqlSchema.currentValue) {
      // const schema = changes.gqlSchema.currentValue;
      this.gqlSchema = changes.gqlSchema.currentValue;
      this.updateDocs(changes.gqlSchema.currentValue);
    }
  }

  updateDocs(schema) {
    console.log(schema);
    this.docsData.rootTypes = [];
    this.docsData.queries = {};
    this.docsData.mutations = {};
    this.docsData.types = [];

    if (schema._queryType) {
      this.docsData.rootTypes.push({
        name: 'Queries',
        key: 'queries',
        description: schema._queryType.description,
        type: '',
        arguments: '',
        fields: schema._queryType._fields
      });

      this.docsData.queries = schema._queryType._fields;

      this.docsData.queries = this._updateTypes(this.docsData.queries);
    }

    if (schema._mutationType) {
      this.docsData.rootTypes.push({
        name: 'Mutations',
        key: 'mutations',
        description: schema._mutationType.description,
        type: '',
        arguments: '',
        fields: schema._mutationType._fields
      });

      this.docsData.mutations = schema._mutationType._fields;

      this.docsData.mutations = this._updateTypes(this.docsData.mutations);
    }
  }

  /**
   * Get the formatted value of the types in a queries object
   * @param queries
   */
  _updateTypes(queries) {
    for (const key in queries) {
      if (queries.hasOwnProperty(key)) {
        const curQuery = queries[key];
        curQuery.typeValue = curQuery.type.inspect();

        curQuery.args.map(v => {
          const _v = v;
          _v.typeValue = v.type.inspect();
          return _v;
        });
      }
    }

    return queries;
  }

  goToDocItem(routeObj) {
    this.currentDocView = routeObj;
  }
}
