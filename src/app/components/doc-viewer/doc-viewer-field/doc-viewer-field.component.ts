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
  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  cleanName(name) {
    return name.replace(/[\[\]!]/g, '');
  }

  goToField(name, parentType) {
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
    this.goToTypeChange.next({ name });
  }

}
