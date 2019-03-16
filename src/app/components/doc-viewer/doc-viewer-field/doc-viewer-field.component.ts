import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-doc-viewer-field',
  templateUrl: './doc-viewer-field.component.html',
  styleUrls: ['./doc-viewer-field.component.scss']
})
export class DocViewerFieldComponent implements OnInit {
  @Input() data: any = {};
  @Input() gqlSchema;
  @Input() parentType = '';
  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  @Output() addToEditorChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  cleanName(name) {
    return name.replace(/[\[\]!]/g, '');
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
    // console.log('field field', name, parentType);
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
    // console.log('field type', name);
    this.goToTypeChange.next({ name });
  }

  addToEditor(data) {
    this.addToEditorChange.next(data);
  }

}
