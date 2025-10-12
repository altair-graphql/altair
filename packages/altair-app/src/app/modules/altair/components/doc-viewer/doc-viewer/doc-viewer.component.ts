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
  output
} from '@angular/core';

import { debug } from '../../../utils/logger';

import { UntilDestroy } from '@ngneat/until-destroy';
import { GraphQLSchema, GraphQLObjectType, GraphQLDirective } from 'graphql';
import { DocumentIndexEntry } from '../models';
import { fadeInOutAnimationTrigger } from '../../../animations';
import { GqlService } from '../../../services';
import getRootTypes from '../../../utils/get-root-types';
import { DocView } from 'altair-graphql-core/build/types/state/docs.interfaces';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { getDocUtilsWorkerAsyncClass } from './worker-helper';
import { SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { debounce } from 'lodash-es';

@UntilDestroy()
@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  animations: [fadeInOutAnimationTrigger],
  standalone: false,
})
export class DocViewerComponent {
  private gqlService = inject(GqlService);
  private altairConfig = inject(AltairConfig);

  readonly gqlSchema = input<GraphQLSchema>();
  readonly allowIntrospection = input(true);
  readonly hideDeprecatedDocItems = input(false);
  readonly isLoading = input(false);
  readonly addQueryDepthLimit = input(this.altairConfig.add_query_depth_limit);
  readonly tabSize = input(this.altairConfig.tab_size);
  readonly docView = input<DocView>({ view: 'root' });
  readonly lastUpdatedAt = input<number>();

  readonly toggleDocsChange = output();
  readonly setDocViewChange = output<DocView>();
  readonly addQueryToEditorChange = output();
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
}
