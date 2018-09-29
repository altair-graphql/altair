import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-query-collection-item',
  templateUrl: './query-collection-item.component.html',
  styleUrls: ['./query-collection-item.component.scss']
})
export class QueryCollectionItemComponent implements OnInit {
  @Input() collection: any = {};

  @Output() selectQueryChange = new EventEmitter();

  showContent = true;

  constructor() { }

  ngOnInit() {
  }

  getQueryCount(collection) {
    return collection.queries.length;
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

}
