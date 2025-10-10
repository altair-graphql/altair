import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  input,
  signal,
  computed,
  Signal,
  effect,
  inject,
} from '@angular/core';
import {
  IQueryCollection,
  IQueryCollectionTree,
  SortByOptions,
  IQuery,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import { QueryCollectionService } from '../../services';
import { WorkspaceOption } from '../../store';

export function debounce<T>(input: Signal<T>, delay = 300) {
  const out = signal(input());
  let timeout: any;

  effect(() => {
    const value = input();
    clearTimeout(timeout);
    timeout = setTimeout(() => out.set(value), delay);
  });

  return out.asReadonly();
}

@Component({
  selector: 'app-query-collections',
  templateUrl: './query-collections.component.html',
  standalone: false,
})
export class QueryCollectionsComponent implements OnInit {
  private collectionService = inject(QueryCollectionService);

  readonly showCollections = input(true);
  readonly collections = input<IQueryCollection[]>([]);
  readonly workspaces = input<WorkspaceOption[]>([]);
  readonly sortBy = input<SortByOptions>('newest');
  readonly queriesSortBy = input<SortByOptions>('newest');
  readonly loggedIn = input(false);

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

  readonly workspaceId = signal('');
  readonly searchInput = signal('');
  searchTerm = debounce(this.searchInput, 300);

  readonly showSearch = signal(false);

  readonly filteredCollectionTrees = computed(() => {
    let trees = this.collectionService.getCollectionTrees(this.collections());

    if (this.searchTerm()) {
      trees = trees
        .map((tree) => this.filterCollectionTree(tree, this.searchTerm()))
        .filter((tree): tree is IQueryCollectionTree => !!tree);
    }

    // workspace filtering (if needed)
    if (this.workspaceId()) {
      if (this.workspaceId() === WORKSPACES.LOCAL) {
        trees = trees.filter((t) => ['local', undefined].includes(t.storageType));
      } else {
        trees = trees.filter((t) => t.workspaceId === this.workspaceId());
      }
    }
    return trees;
  });
  readonly expandedMap = computed<{ [id: string]: boolean }>(() => {
    const map: { [id: string]: boolean } = {};
    if (!this.searchTerm()) {
      return map;
    }
    // Expand all when searching
    this.filteredCollectionTrees().forEach((c) => {
      map[c.id] = true;
    });
    return map;
  });
  readonly collectionTrees = computed(
    () => this.collectionService.getCollectionTrees(this.collections()) || []
  );

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

  ngOnInit() {
    this.loadCollectionsChange.emit();
  }

  trackById<T extends { id: string }>(index: number, collection: T) {
    return collection.id;
  }

  onSearchInput(value: string) {
    this.searchInput.set(value);
  }
}
