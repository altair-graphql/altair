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
  @Output() showQueryRevisionsChange = new EventEmitter<string>();
  @Output() copyQueryShareLinkChange = new EventEmitter<string>();

  collections$ = new BehaviorSubject<IQueryCollection[]>([]);
  workspaces$ = new BehaviorSubject<WorkspaceOption[]>([]);
  workspaceId$ = new BehaviorSubject('');

  searchTerm$ = new BehaviorSubject<string>('');

  expandedMap: { [id: string]: boolean } = {};

  // Recursively filter collections and their subcollections for matching queries
  private filterCollectionTree(collection: any, searchTerm: string): any | null {
    const lower = searchTerm.toLowerCase();
    const filteredQueries = collection.queries?.filter((q: any) => q.windowName?.toLowerCase().includes(lower)) || [];
    const subcollections = (collection.collections || [])
      .map((sub: any) => this.filterCollectionTree(sub, searchTerm))
      .filter(Boolean);
    if (filteredQueries.length > 0 || subcollections.length > 0) {
      return {
        ...collection,
        queries: filteredQueries,
        collections: subcollections,
      };
    }
    return null;
  }

  filteredCollectionTrees$ = combineLatest([
    this.collections$,
    this.workspaceId$,
    this.searchTerm$,
  ]).pipe(
    map(([collections, workspaceId, searchTerm]) => {
      let trees = this.collectionService.getCollectionTrees(collections);
      if (searchTerm) {
        trees = trees
          .map(tree => this.filterCollectionTree(tree, searchTerm))
          .filter((tree): tree is any => !!tree);
        this.expandedMap = Object.fromEntries(trees.map(c => [c.id, true]));
      } else {
        this.expandedMap = {};
      }
      // workspace filtering (if needed)
      if (!workspaceId) return trees;
      if (workspaceId === WORKSPACES.LOCAL) {
        return trees.filter(t => ['local', undefined].includes(t.storageType));
      }
      return trees.filter(t => t.workspaceId === workspaceId);
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

  setSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }
}
