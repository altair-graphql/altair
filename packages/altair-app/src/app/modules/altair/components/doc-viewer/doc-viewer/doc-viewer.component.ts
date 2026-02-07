import {
  Component,
  HostBinding,
  ElementRef,
  ViewChild,
  input,
  computed,
  effect,
  signal,
  inject,
  output,
} from '@angular/core';

import { debug } from '../../../utils/logger';

import { UntilDestroy } from '@ngneat/until-destroy';
import { GraphQLSchema, GraphQLObjectType, GraphQLDirective } from 'graphql';
import { DocumentIndexEntry, DocSearchFilterKey, DOC_SEARCH_FILTERS } from '../models';
import { GqlService } from '../../../services';
import getRootTypes from '../../../utils/get-root-types';
import { DocView } from 'altair-graphql-core/build/types/state/docs.interfaces';
import { getDocUtilsWorkerAsyncClass } from './worker-helper';
import { SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { DEFAULT_OPTIONS } from 'altair-graphql-core/build/config/defaults';
import { debounce } from 'lodash-es';

@UntilDestroy()
@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  standalone: false,
})
export class DocViewerComponent {
  private gqlService = inject(GqlService);

  readonly gqlSchema = input<GraphQLSchema>();
  readonly allowIntrospection = input(true);
  readonly hideDeprecatedDocItems = input(false);
  readonly isLoading = input(false);
  readonly addQueryDepthLimit = input<number>(DEFAULT_OPTIONS.ADD_QUERY_DEPTH_LIMIT);
  readonly tabSize = input<number>(DEFAULT_OPTIONS.TAB_SIZE);
  readonly docView = input<DocView>({ view: 'root' });
  readonly lastUpdatedAt = input<number>();

  readonly toggleDocsChange = output();
  readonly setDocViewChange = output<DocView>();
  readonly addQueryToEditorChange = output<{
    query: string;
    meta: {
      hasArgs: boolean;
    };
  }>();
  readonly exportSDLChange = output();
  readonly loadSchemaChange = output();

  @HostBinding('style.flex-grow') public resizeFactor?: number;
  @ViewChild('docViewer') docViewerRef?: ElementRef;

  readonly rootTypes = computed<GraphQLObjectType[]>(() => {
    const schema = this.gqlSchema();
    if (schema) {
      return getRootTypes(schema);
    }
    return [];
  });
  readonly directives = computed<readonly GraphQLDirective[]>(() => {
    const schema = this.gqlSchema();
    if (schema) {
      return schema.getDirectives();
    }
    return [];
  });
  readonly index = signal<DocumentIndexEntry[]>([]);

  searchInputPlaceholder = 'Search docs...';

  // Used to determine if index related actions (like search, add query, etc.)
  // should be available
  readonly hasSearchIndex = signal(false);

  readonly docHistory = signal<DocView[]>([]);

  readonly searchResult = signal<DocumentIndexEntry[]>([]);
  readonly searchTerm = signal('');
  readonly autocompleteOptions = signal<DocumentIndexEntry[]>([]);
  readonly searchFilters = signal<Set<DocSearchFilterKey>>(
    new Set<DocSearchFilterKey>(['types', 'fields', 'queries', 'mutations', 'subscriptions', 'directives'])
  );

  readonly availableSearchFilters = DOC_SEARCH_FILTERS;

  docUtilWorker: any;

  sortFieldsByOption: SortByOptions = 'none';

  readonly typeData = computed(() => {
    const docView = this.docView();
    const gqlSchema = this.gqlSchema();
    if (docView.view === 'type' && gqlSchema) {
      return gqlSchema.getType(docView.name);
    }
    return;
  });

  constructor() {
    effect(async () => {
      const schema = this.gqlSchema();
      if (!schema) {
        return;
      }
      try {
        const docUtilWorker = await this.getDocUtilsWorker();
        const sdl = await this.gqlService.getSDL(schema);
        await docUtilWorker.updateSchema(sdl);
        this.index.set(await this.docUtilWorker.generateSearchIndex());
        debug.log('Worker index:', this.index());
        this.hasSearchIndex.set(true);
      } catch (err) {
        debug.log('Error while generating index.', err);
        this.hasSearchIndex.set(false);
      }
    });
  }

  async filterAutocompleteOptions(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    const docUtils = await this.getDocUtilsWorker();
    this.autocompleteOptions.set(await docUtils.searchDocs(term));
  }
  debouncedFilterAutocompleteOptions = debounce(this.filterAutocompleteOptions, 300);

  setDocView(docView?: DocView) {
    if (!docView) {
      docView = { view: 'root' };
    }
    this.setDocViewChange.emit(docView);
    if (this.docViewerRef) {
      this.docViewerRef.nativeElement.scrollTop = 0;
    }
  }

  /**
   * search through the docs for the provided term
   */
  async searchDocs(term: string | { name: string }) {
    if (typeof term !== 'string') {
      term = term.name;
    }

    if (!this.hasSearchIndex()) {
      return false;
    }
    this.updateDocHistory();
    this.setDocView({ view: 'search' });
    const docUtilWorker = await this.getDocUtilsWorker();
    this.searchResult.set(await docUtilWorker.searchDocs(term));
    debug.log(this.searchResult);
  }

  /**
   * Cleans out getType() names to contain only the type name itself
   * @param name
   */
  cleanName(name: string) {
    return name.replace(/[[\]!]/g, '');
  }

  /**
   * Go back through the doc history
   */
  goBack() {
    if (this.docHistory().length) {
      const history = this.docHistory();
      const lastItem = history.pop();
      this.docHistory.set(history);
      // Set the doc view to the last item in history
      this.setDocView(lastItem);
    }
  }

  /**
   * Go back to root view
   */
  goHome() {
    this.setDocView({ view: 'root' });
    this.docHistory.set([]);
  }

  /**
   * Update the doc history with the current view
   */
  updateDocHistory() {
    if (this.docView().view !== 'search') {
      this.docHistory.set([...this.docHistory(), { ...this.docView() }]);
    }
  }

  /**
   * Updates the doc view for a particular type
   * @param name name of type
   */
  goToType(name: string) {
    this.updateDocHistory();
    this.setDocView({ view: 'type', name: name.replace(/[[\]!]/g, '') });
  }

  /**
   * Updates the doc view for a particular field
   * @param name name of field
   * @param parentType name of parent type of field
   */
  goToField(name: string, parentType: string) {
    this.updateDocHistory();
    this.setDocView({
      view: 'field',
      name: name.replace(/[[\]!]/g, ''),
      parentType: parentType.replace(/[[\]!]/g, ''),
    });
  }

  /**
   * Updates the doc view for a particular directive
   * @param name name of directive
   */
  goToDirective(name: string) {
    this.updateDocHistory();
    this.setDocView({ view: 'directive', name: name.replace(/[[\]!@]/g, '') });
  }

  async addToEditor(name: string, parentType: string) {
    if (!this.hasSearchIndex()) {
      debug.log('No search index, so cannot add to editor');
      return false;
    }
    const docUtilsWorker = await this.getDocUtilsWorker();
    const generatedQuery = await docUtilsWorker.generateQueryV2(name, parentType, {
      tabSize: this.tabSize(),
      addQueryDepthLimit: this.addQueryDepthLimit(),
    });
    if (generatedQuery) {
      this.addQueryToEditorChange.emit(generatedQuery);
    }
  }

  getField(docView: DocView) {
    if (docView.view === 'field') {
      const type = this.gqlSchema()?.getType(docView.parentType);
      if (type) {
        if (type instanceof GraphQLObjectType) {
          const fieldMap = type.getFields();
          return fieldMap[docView.name];
        }
      }
    }
  }

  exportSDL() {
    this.exportSDLChange.emit();
  }

  async getDocUtilsWorker() {
    if (!this.docUtilWorker) {
      try {
        const DocUtils: any = getDocUtilsWorkerAsyncClass();
        this.docUtilWorker = await new DocUtils();
      } catch (error) {
        debug.error(
          'Could not load doc utilsweb worker, falling back to main thread'
        );
        debug.error(error);
        const { DocUtils: ImportedDocUtils } = await import('../doc-utils');
        this.docUtilWorker = new ImportedDocUtils();
      }
    }
    return this.docUtilWorker;
  }

  onResize(resizeFactor: number) {
    this.resizeFactor = resizeFactor;
  }

  setSortFieldsByOption(v: SortByOptions) {
    this.sortFieldsByOption = v;
  }

  rootTypeTrackBy(index: number, type: GraphQLObjectType) {
    return type.name;
  }

  directiveTrackBy(index: number, directive: GraphQLDirective) {
    return directive.name;
  }

  getDirective(docView: DocView) {
    if (docView.view === 'directive') {
      return this.directives().find((d) => d.name === docView.name);
    }
  }

  /**
   * Navigate to a specific point in history
   * @param index The index in history to navigate to
   */
  navigateToBreadcrumb(index: number) {
    if (index === -1) {
      // Navigate to home
      this.goHome();
      return;
    }

    const history = this.docHistory();
    if (index >= 0 && index < history.length) {
      // Get the view at the specified index
      const targetView = history[index];
      // Update history to only include items up to this point
      this.docHistory.set(history.slice(0, index));
      // Navigate to the target view
      this.setDocView(targetView);
    }
  }

  /**
   * Get a readable label for a doc view for breadcrumb display
   * @param docView The doc view to get label for
   */
  getBreadcrumbLabel(docView: DocView): string {
    switch (docView.view) {
      case 'root':
        return 'Home';
      case 'type':
        return docView.name;
      case 'field':
        return `${docView.parentType}.${docView.name}`;
      case 'directive':
        return `@${docView.name}`;
      case 'search':
        return 'Search Results';
      default:
        return '';
    }
  }

  /**
   * Determine if ellipsis should be shown in breadcrumbs
   * Show ellipsis when there are more than 2 items in history (excluding root views)
   */
  shouldShowEllipsis(): boolean {
    const history = this.docHistory();
    const nonRootHistory = history.filter(item => item.view !== 'root');
    return nonRootHistory.length > 2;
  }

  /**
   * Get the visible breadcrumb items (last 2 before current)
   * Returns items with their original indices for navigation
   */
  getVisibleBreadcrumbs(): Array<{ view: DocView; index: number }> {
    const history = this.docHistory();
    const nonRootHistory: Array<{ view: DocView; index: number }> = [];
    
    // Build array with original indices
    history.forEach((item, index) => {
      if (item.view !== 'root') {
        nonRootHistory.push({ view: item, index });
      }
    });

    // If 2 or fewer items, show all
    if (nonRootHistory.length <= 2) {
      return nonRootHistory;
    }

    // Otherwise, show last 2
    return nonRootHistory.slice(-2);
  toggleSearchFilter(filter: DocSearchFilterKey) {
    const filters = new Set(this.searchFilters());
    if (filters.has(filter)) {
      filters.delete(filter);
    } else {
      filters.add(filter);
    }
    this.searchFilters.set(filters);
  }

  isSearchFilterActive(filter: DocSearchFilterKey): boolean {
    return this.searchFilters().has(filter);
  }
}
