import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-doc-viewer-item-query-details',
  templateUrl: './doc-viewer-item-query-details.component.html',
  styleUrls: ['./doc-viewer-item-query-details.component.scss']
})
export class DocViewerItemQueryDetailsComponent implements OnInit {

  @Input() queryData = <any>{};
  @Output() goToDocItemChange = new EventEmitter();

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

  goToDocItem(routeObj) {
    this.goToDocItemChange.next(routeObj);
  }
}
