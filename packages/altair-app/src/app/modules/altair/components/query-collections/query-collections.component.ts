import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  IQueryCollection,
  IQueryCollectionTree,
  SortByOptions,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { QueryCollectionService } from '../../services';
import { WorkspaceOption } from '../../store';

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  styleUrls: ['./query-collections.component.scss'],
})
export class QueryCollectionsComponent implements OnInit, OnChanges {
  @Input() showCollections = true;
  @Input() set collections(val: IQueryCollection[] | undefined) {
    if (val) {
      this.collections$.next(val);
    }
  }
  @Input() set workspaces(val: WorkspaceOption[]) {
    this.workspaces$.next(val);
  }
  @Input() sortBy: SortByOptions = 'newest';
  @Input() queriesSortBy: SortByOptions = 'newest';
  @Input() loggedIn = false;

  @Output() loadCollectionsChange = new EventEmitter();
  @Output() selectQueryChange = new EventEmitter();
  @Output() deleteQueryChange = new EventEmitter();
  @Output() deleteCollectionChange: EventEmitter<{
    collectionId: string;
  }> = new EventEmitter();
  @Output() editCollectionChange: EventEmitter<{
    collection: IQueryCollection;
  }> = new EventEmitter();
  @Output() syncCollectionChange: EventEmitter<{
    collection: IQueryCollection;
  }> = new EventEmitter();
  @Output() exportCollectionChange = new EventEmitter();
  @Output() importCollectionsChange = new EventEmitter();
  @Output() syncCollectionsChange = new EventEmitter();
  @Output() sortCollectionsChange = new EventEmitter<SortByOptions>();
  @Output() sortCollectionQueriesChange = new EventEmitter<SortByOptions>();

  collections$ = new BehaviorSubject<IQueryCollection[]>([]);
  workspaces$ = new BehaviorSubject<WorkspaceOption[]>([]);
  workspaceId$ = new BehaviorSubject('');

  filteredCollectionTrees$ = combineLatest([
    this.collections$,
    this.workspaceId$,
  ]).pipe(
    map(([collections, workspaceId]) => {
      const trees = this.collectionService.getCollectionTrees(collections);
      // All
      if (!workspaceId) {
        return trees;
      }

      if (workspaceId === WORKSPACES.LOCAL) {
        return trees.filter((t) =>
          ['local', undefined].includes(t.storageType)
        );
      }

      return trees.filter((t) => t.workspaceId === workspaceId);
    })
  );

  collectionTrees: IQueryCollectionTree[] = [];

  constructor(private collectionService: QueryCollectionService) {}

  ngOnInit() {
    this.loadCollectionsChange.emit();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.collections?.currentValue) {
      this.setCollectionTrees(changes.collections.currentValue);
    }
  }

  setCollectionTrees(collections: IQueryCollection[]) {
    this.collectionTrees =
      this.collectionService.getCollectionTrees(collections);
  }

  trackById<T extends { id: string }>(index: number, collection: T) {
    return collection.id;
  }
}
