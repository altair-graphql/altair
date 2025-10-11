import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input,
  inject,
  linkedSignal,
} from '@angular/core';
import {
  IQuery,
  IQueryCollectionTree,
  SortByOptions,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { NzModalService } from 'ng-zorro-antd/modal';
import { memoize } from '../../utils/memoize';

@Component({
  selector: 'app-query-collection-item',
  templateUrl: './query-collection-item.component.html',
  styleUrls: ['./query-collection-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class QueryCollectionItemComponent {
  private modal = inject(NzModalService);

  readonly collectionTree = input.required<IQueryCollectionTree>();
  readonly loggedIn = input(false);
  readonly queriesSortBy = input<SortByOptions>('newest');
  readonly expanded = input(true);

  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange: EventEmitter<{
    collectionId: string;
    query: IQuery;
  }> = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{
    collectionId: string;
  }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{
    collection: IQueryCollectionTree;
  }> = new EventEmitter();
  @Output() syncCollectionChange: EventEmitter<{
    collection: IQueryCollectionTree;
  }> = new EventEmitter();
  @Output() exportCollectionChange = new EventEmitter();
  @Output() sortCollectionQueriesChange = new EventEmitter<SortByOptions>();
  @Output() showQueryRevisionsChange = new EventEmitter<string>();
  @Output() copyQueryShareLinkChange = new EventEmitter<string>();

  readonly showContent = linkedSignal(() => this.expanded());

  getQueryCount(collection: IQueryCollectionTree) {
    return collection.queries && collection.queries.length;
  }

  toggleContent() {
    this.showContent.set(!this.showContent());
  }

  deleteQuery(query: IQuery) {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this query from the collection?',
      nzContent: 'Note: This is an irreversible action.',
      nzOkText: 'Yes',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        if (this.collectionTree()) {
          this.deleteQueryChange.emit({
            query,
            collectionId: this.collectionTree().id,
          });
        }
      },
    });
  }

  showQueryRevisionsDialog(query: IQuery) {
    this.showQueryRevisionsChange.emit(query.id);
  }

  deleteCollection() {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this collection?',
      nzContent: 'Note: This is an irreversible action.',
      nzOkText: 'Yes',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        if (this.collectionTree()) {
          this.deleteCollectionChange.emit({
            collectionId: this.collectionTree().id,
          });
        }
      },
    });
  }

  editCollection() {
    if (!this.collectionTree()) {
      throw new Error('should never happen');
    }
    this.editCollectionChange.emit({ collection: this.collectionTree() });
  }

  syncCollection() {
    if (!this.collectionTree()) {
      throw new Error('should never happen');
    }
    this.syncCollectionChange.emit({ collection: this.collectionTree() });
  }

  exportCollection() {
    if (!this.collectionTree()) {
      throw new Error('should never happen');
    }
    this.exportCollectionChange.emit({
      collectionId: this.collectionTree().id,
    });
  }
  setQueriesSortBy(sortBy: SortByOptions) {
    this.sortCollectionQueriesChange.emit(sortBy);
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

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}
