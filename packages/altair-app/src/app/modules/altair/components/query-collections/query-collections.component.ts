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
  IQuery,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { QueryCollectionService } from '../../services';
import { WorkspaceOption } from '../../store';

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  standalone: false,
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
  @Output() showQueryRevisionsChange = new EventEmitter<string>();
  @Output() copyQueryShareLinkChange = new EventEmitter<string>();

  collections$ = new BehaviorSubject<IQueryCollection[]>([]);
  workspaces$ = new BehaviorSubject<WorkspaceOption[]>([]);
  workspaceId$ = new BehaviorSubject('');

  searchTerm$ = new BehaviorSubject<string>('');
  searchInput$ = new Subject<string>();

  expandedMap: { [id: string]: boolean } = {};

  showSearch$ = new BehaviorSubject(false);

  // Recursively filter collections and their subcollections for matching queries
  private filterCollectionTree(
    collection: IQueryCollectionTree,
    searchTerm: string
  ): (IQueryCollectionTree & { matchesSearch?: boolean }) | null {
    const lower = searchTerm.toLowerCase();
    const filteredQueries =
      collection.queries?.filter((q: IQuery) =>
        q.windowName?.toLowerCase().includes(lower)
      ) || [];
    const subcollections = (collection.collections || [])
      .map((sub: IQueryCollectionTree) => this.filterCollectionTree(sub, searchTerm))
      .filter((c): c is IQueryCollectionTree & { matchesSearch?: boolean } => !!c);
    const matchesSearch = filteredQueries.length > 0;
    if (matchesSearch || subcollections.length > 0) {
      return {
        ...collection,
        queries: filteredQueries,
        collections: subcollections,
        matchesSearch,
      };
    }
    return null;
  }

  filteredCollectionTrees$ = combineLatest([
    this.collections$,
    this.workspaceId$,
    this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()),
  ]).pipe(
    map(([collections, workspaceId, searchTerm]) => {
      let trees = this.collectionService.getCollectionTrees(collections);
      let expandedMap: { [id: string]: boolean } = {};

      if (searchTerm) {
        trees = trees
          .map((tree) => this.filterCollectionTree(tree, searchTerm))
          .filter((tree): tree is IQueryCollectionTree => !!tree);
        expandedMap = Object.fromEntries(trees.map((c) => [c.id, true]));
      }

      // workspace filtering (if needed)
      if (workspaceId) {
        if (workspaceId === WORKSPACES.LOCAL) {
          trees = trees.filter((t) => ['local', undefined].includes(t.storageType));
        } else {
          trees = trees.filter((t) => t.workspaceId === workspaceId);
        }
      }
      return { trees, expandedMap };
    }),
    tap(({ expandedMap }) => {
      this.expandedMap = expandedMap;
    }),
    map(({ trees }) => trees)
  );

  collectionTrees: IQueryCollectionTree[] = [];

  constructor(private collectionService: QueryCollectionService) {}

  ngOnInit() {
    this.loadCollectionsChange.emit();
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((value) => this.setSearchTerm(value));
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.collections?.currentValue) {
      this.setCollectionTrees(changes.collections.currentValue);
    }
  }

  setCollectionTrees(collections: IQueryCollection[]) {
    this.collectionTrees = this.collectionService.getCollectionTrees(collections);
  }

  trackById<T extends { id: string }>(index: number, collection: T) {
    return collection.id;
  }

  onSearchInput(value: string) {
    this.searchInput$.next(value);
  }

  setSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }
}
