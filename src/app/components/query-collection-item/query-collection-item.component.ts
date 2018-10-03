import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-query-collection-item',
  templateUrl: './query-collection-item.component.html',
  styleUrls: ['./query-collection-item.component.scss']
})
export class QueryCollectionItemComponent implements OnInit {
  @Input() collection: any = {};

  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange = new EventEmitter();

  showContent = true;

  constructor() { }

  ngOnInit() {
  }

  getQueryCount(collection) {
    return collection.queries && collection.queries.length;
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  deleteQuery(query) {
    if (confirm('Are you sure you want to delete this query from the collection?')) {
      this.deleteQueryChange.next({
        query,
        collectionId: this.collection.id
      });
    }
  }

}
