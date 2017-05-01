import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-doc-viewer-item-query-details',
  templateUrl: './doc-viewer-item-query-details.component.html',
  styleUrls: ['./doc-viewer-item-query-details.component.scss']
})
export class DocViewerItemQueryDetailsComponent implements OnInit {

  @Input() queryData = <any>{};

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
}
