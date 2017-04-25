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

  currentDocView = {
    section: 'queries',
    parentName: ''
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
    }
  }

  objToArr(obj: any) {
    const arr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(obj[key]);
      }
    }
    return arr;
  }
}
