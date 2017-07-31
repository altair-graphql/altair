import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-doc-viewer-type',
  templateUrl: './doc-viewer-type.component.html',
  styleUrls: ['./doc-viewer-type.component.scss']
})
export class DocViewerTypeComponent implements OnInit {

  @Input() data: any = {};
  @Input() gqlSchema = null;
  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  @Output() addToEditorChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
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
   * Check if the current type is a root type
   * @param type
   */
  isRootType(type) {
    if (!type || !this.gqlSchema) {
      return false;
    }

    switch (type) {
      case this.gqlSchema.getQueryType() && this.gqlSchema.getQueryType().name:
      case this.gqlSchema.getMutationType() && this.gqlSchema.getMutationType().name:
      case this.gqlSchema.getSubscriptionType() && this.gqlSchema.getSubscriptionType().name:
        return true;
    }

    return false;
  }

  goToField(name, parentType) {
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
    this.goToTypeChange.next({ name });
  }

  addToEditor(name, parentType) {
    this.addToEditorChange.next({ name, parentType })
  }
}
