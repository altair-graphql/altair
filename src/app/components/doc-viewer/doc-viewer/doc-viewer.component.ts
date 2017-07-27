import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  // styleUrls: ['./doc-viewer.component.scss']
})
export class DocViewerComponent implements OnChanges {

  @Input() gqlSchema = null;
  @Input() allowIntrospection = true;
  @Output() toggleDocs = new EventEmitter();

  rootTypes = [];
  index = [];

  docHistory = [];

  docView = {
    view: 'root', // type, field, root, search
    parentType: 'Query', // used by field views
    name: 'Conference' // identifies type/field
  };

  searchResult = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes.gqlSchema && changes.gqlSchema.currentValue) {
      // const schema = changes.gqlSchema.currentValue;
      this.gqlSchema = changes.gqlSchema.currentValue;
      this.updateDocs(changes.gqlSchema.currentValue);
    }
  }

  updateDocs(schema) {
    console.log(schema);
    let getFieldsIndices = null;
    let getTypeIndices = null;

    this.rootTypes = [
      schema.getQueryType(),
      schema.getMutationType(),
      schema.getSubscriptionType()
    ].filter(val => !!val);

    /**
     * Gets the indices for fields
     */
    getFieldsIndices = (fields, type, isQuery) => {
      let index = [];

      Object.keys(fields).forEach(fieldKey => {
        const field = fields[fieldKey];

        // For each field, create an entry in the index
        const fieldIndex = {
          search: field.name,
          name: field.name,
          description: field.description,
          args: field.args,
          cat: 'field',
          type: type.name,
          isQuery
        };
        index = [...index, fieldIndex];

        // For each argument of the field, create an entry in the index for the field,
        // searchable by the argument name
        if (field.args.length) {
          field.args.forEach(arg => {
            index = [...index, {
              ...fieldIndex,
              search: arg.name,
            }];
          });
        }

        // If the field has a type, get indices for the type as well
        if (field.type) {
          index = [...index, ...getTypeIndices(field.type).filter(val => !!val)];
        }

      });

      return index;
    };

    /**
     * Gets the indices for types
     */
    getTypeIndices = (type, isRoot) => {
      let fields = null;

      if (!type.name) {
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
          description: type.description,
          isRoot
        }
      ];

      if (fields) {
        return [...index, ...getFieldsIndices(fields, type, isRoot).filter(val => !!val)];
      }

      return index;
    };

    this.index = [];

    // Store the indices of all the types and fields
    this.rootTypes.forEach(type => {
      this.index = [...this.index, ...getTypeIndices(type, true)];
    });

    console.log('Index: ', this.index);
  }

  /**
   * search through the docs for the provided term
   */
  searchDocs(term) {
    this.docView.view = 'search';
    this.searchResult = this.index.filter(item => new RegExp(term, 'i').test(item.search));
    console.log(this.searchResult);
  }

  /**
   * Transform an object into an array
   * @param obj
   */
  objToArr(obj: any) {
    const arr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(obj[key]);
      }
    }
    return arr;
  }

  /**
   * Go back through the doc history
   */
  goBack() {
    // console.log(this.docHistory);
    if (this.docHistory.length) {
      this.docView = this.docHistory.pop();
    }
  }

  /**
   * Updates the doc view for a particular type
   * @param name name of type
   */
  goToType(name) {
    this.docHistory.push(Object.assign({}, this.docView));
    // console.log('Going to type..', name);
    this.docView.view = 'type';
    this.docView.name = name.replace(/[\[\]!]/g, '');
  }

  /**
   * Updates the doc view for a particular field
   * @param name name of field
   * @param parentType name of parent type of field
   */
  goToField(name, parentType) {
    this.docHistory.push(Object.assign({}, this.docView));
    // console.log('Going to field..', name, parentType);
    this.docView.view = 'field';
    this.docView.name = name.replace(/[\[\]!]/g, '');
    this.docView.parentType = parentType.replace(/[\[\]!]/g, '');
  }
}
