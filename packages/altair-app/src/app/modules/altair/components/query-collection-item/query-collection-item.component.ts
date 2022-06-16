import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  IQuery,
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { memoize } from '../../utils/memoize';

type SortByOptions = 'a-z' | 'z-a' | 'newest' | 'oldest';
@Component({
  selector: 'app-query-collection-item',
  templateUrl: './query-collection-item.component.html',
  styleUrls: ['./query-collection-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryCollectionItemComponent {
  @Input() collectionTree: IQueryCollectionTree;
  @Input() loggedIn = false;

  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange: EventEmitter<{
    collectionId: number | string;
    query: IQuery;
  }> = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{
    collectionId: number | string;
  }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{
    collection: IQueryCollectionTree;
  }> = new EventEmitter();
  @Output() syncCollectionChange: EventEmitter<{
    collection: IQueryCollectionTree;
  }> = new EventEmitter();
  @Output() exportCollectionChange = new EventEmitter();

  sortBy: SortByOptions = 'newest';

  showContent = true;

  constructor() {}

  getQueryCount(collection: IQueryCollectionTree) {
    return collection.queries && collection.queries.length;
  }

  toggleContent() {
    this.showContent = !this.showContent;
  }

  deleteQuery(query: IQuery) {
    if (
      confirm('Are you sure you want to delete this query from the collection?')
    ) {
      this.deleteQueryChange.next({
        query,
        collectionId: this.collectionTree.id,
      });
    }
  }

  deleteCollection() {
    if (confirm('Are you sure you want to delete this collection?')) {
      this.deleteCollectionChange.next({
        collectionId: this.collectionTree.id,
      });
    }
  }

  editCollection() {
    this.editCollectionChange.next({ collection: this.collectionTree });
  }

  syncCollection() {
    this.syncCollectionChange.next({ collection: this.collectionTree });
  }

  exportCollection() {
    this.exportCollectionChange.next({
      collectionId: this.collectionTree.id,
    });
  }
  setQueriesSortBy(sortBy: SortByOptions) {
    this.sortBy = sortBy;
  }

  @memoize()
  sortedCollectionQueries(queries: IQuery[], sortBy: SortByOptions) {
    if (!queries) {
      return [];
    }

    switch (sortBy) {
      case 'a-z':
        return queries.sort((a, b) => {
          const aName = a.windowName.toLowerCase() || a.updated_at || '';
          const bName = b.windowName.toLowerCase() || b.updated_at || '';

          if (aName > bName) {
            return 1;
          }
          if (aName < bName) {
            return -1;
          }
          return 0;
        });
      case 'z-a':
        return queries.sort((a, b) => {
          const aName = a.windowName.toLowerCase() || a.updated_at || '';
          const bName = b.windowName.toLowerCase() || b.updated_at || '';

          if (aName > bName) {
            return -1;
          }
          if (aName < bName) {
            return 1;
          }
          return 0;
        });
      case 'oldest':
        return queries.sort((a, b) => {
          const aTimeStamp = a.updated_at || a.windowName.toLowerCase();
          const bTimeStamp = b.updated_at || b.windowName.toLowerCase();

          if (aTimeStamp > bTimeStamp) {
            return -1;
          }
          if (aTimeStamp < bTimeStamp) {
            return 1;
          }
          return 0;
        });
      case 'newest':
        return queries.sort((a, b) => {
          const aTimeStamp = a.updated_at || a.windowName.toLowerCase();
          const bTimeStamp = b.updated_at || b.windowName.toLowerCase();

          if (aTimeStamp > bTimeStamp) {
            return 1;
          }
          if (aTimeStamp < bTimeStamp) {
            return -1;
          }
          return 0;
        });
      default:
        return queries;
    }
  }

  trackById(index: number, collection: IQueryCollection) {
    return collection.id;
  }
}
