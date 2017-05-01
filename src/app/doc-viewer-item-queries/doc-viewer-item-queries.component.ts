import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-doc-viewer-item-queries',
  templateUrl: './doc-viewer-item-queries.component.html',
  styleUrls: ['./doc-viewer-item-queries.component.scss']
})
export class DocViewerItemQueriesComponent implements OnInit {

  @Input() queries = {};
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
