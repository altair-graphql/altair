import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-query-collection-item',
  templateUrl: './query-collection-item.component.html',
  styleUrls: ['./query-collection-item.component.scss']
})
export class QueryCollectionItemComponent implements OnInit {
  @Input() collection: any = {};

  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange: EventEmitter<{ collectionId, query }> = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{ collectionId }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{ collection }> = new EventEmitter();
  @Output() exportCollectionChange = new EventEmitter();


  sortBy: 'a-z' | 'z-a' | 'newest' | 'oldest' = 'newest';

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

  deleteCollection() {
    if (confirm('Are you sure you want to delete this collection?')) {
      this.deleteCollectionChange.next({
        collectionId: this.collection.id
      });
    }
  }

  editCollection() {
    this.editCollectionChange.next({ collection: this.collection });
  }

  exportCollection() {
    this.exportCollectionChange.next({
      collectionId: this.collection.id
    });
  }
  setQueriesSortBy(sortBy) {
    this.sortBy = sortBy;
  }
  sortedCollectionQueries() {
    if (!this.collection.queries) {
      return [];
    }

    switch (this.sortBy) {
      case 'a-z':
        return this.collection.queries.sort((a, b) => {
          const aName = a.windowName.toLowerCase();
          const bName = b.windowName.toLowerCase();

          if (aName > bName) {
            return 1;
          }
          if (aName < bName) {
            return -1;
          }
          return 0;
        });
      case 'z-a':
        return this.collection.queries.sort((a, b) => {
          const aName = a.windowName.toLowerCase();
          const bName = b.windowName.toLowerCase();

          if (aName > bName) {
            return -1;
          }
          if (aName < bName) {
            return 1;
          }
          return 0;
        });
      case 'newest':
        return this.collection.queries.sort((a, b) => {
          const aTimeStamp = a.updated_at;
          const bTimeStamp = b.updated_at;

          if (aTimeStamp > bTimeStamp) {
            return -1;
          }
          if (aTimeStamp < bTimeStamp) {
            return 1;
          }
          return 0;
        });
      case 'oldest':
        return this.collection.queries.sort((a, b) => {
          const aTimeStamp = a.updated_at;
          const bTimeStamp = b.updated_at;

          if (aTimeStamp > bTimeStamp) {
            return 1;
          }
          if (aTimeStamp < bTimeStamp) {
            return -1;
          }
          return 0;
        });
      default:
        return this.collection.queries;
    }
  }

}
