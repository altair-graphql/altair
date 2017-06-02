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
  @Output() goToFieldChange = new EventEmitter();
  @Output() goToTypeChange = new EventEmitter();

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

  goToField(name, parentType) {
    this.goToFieldChange.next({ name, parentType });
  }

  goToType(name) {
    this.goToTypeChange.next({ name });
  }

}
