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
  @Output() toggleDocs = new EventEmitter();

  rootTypes = [];

  docHistory = [];

  docView = {
    view: 'root', // type, field, root
    parentType: 'Query', // used by field views
    name: 'Conference' // identifies type/field
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
    this.rootTypes = [
      schema.getQueryType(),
      schema.getMutationType(),
      schema.getSubscriptionType()
    ];
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
