import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostBinding,
  ChangeDetectionStrategy,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';

import { AltairConfig } from '../../../config';
import { debug } from 'app/utils/logger';
import { DomSanitizer } from '@angular/platform-browser';
import * as fromDocs from '../../../reducers/docs/docs';

import { untilDestroyed } from 'ngx-take-until-destroy';
import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';
import { DocumentIndexEntry } from '../models';
import { fadeInOutAnimationTrigger } from 'app/animations';
import * as Comlink from 'comlink';
import { GqlService } from 'app/services';
import getRootTypes from 'app/utils/get-root-types';

let DocUtils: any = null;
try {
  DocUtils = Comlink.wrap(new Worker('../doc-utils.worker', { type: 'module' }));
} catch (error) {
  debug.error('Could not load doc utilsweb worker');
  debug.error(error);
  DocUtils = null;
}

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInOutAnimationTrigger,
  ]
  // styleUrls: ['./doc-viewer.component.scss']
})
export class DocViewerComponent implements OnChanges, OnDestroy {

  @Input() gqlSchema: GraphQLSchema;
  @Input() allowIntrospection = true;
  @Input() isLoading = false;
  @Input() addQueryDepthLimit = this.altairConfig.add_query_depth_limit;
  @Input() tabSize = this.altairConfig.tab_size;
  @Input() docView: fromDocs.DocView = {
    view: 'root', // type, field, root, search
    parentType: 'Query', // used by field views
    name: 'Conference' // identifies type/field
  };
  @Input() lastUpdatedAt: number;

  @Output() toggleDocsChange = new EventEmitter();
  @Output() setDocViewChange = new EventEmitter<Partial<fromDocs.DocView>>();
  @Output() addQueryToEditorChange = new EventEmitter();
  @Output() exportSDLChange = new EventEmitter();
  @Output() loadSchemaChange = new EventEmitter();

  @HostBinding('style.flex-grow') public resizeFactor: number;
  @ViewChild('docViewer') docViewerRef: ElementRef;

  rootTypes: GraphQLObjectType[] = [];
  index: DocumentIndexEntry[] = [];

  searchInputPlaceholder = 'Search docs...';

  // Used to determine if index related actions (like search, add query, etc.)
  // should be available
  hasSearchIndex = false;

  docHistory: fromDocs.DocView[] = [];

  searchResult: DocumentIndexEntry[] = [];
  searchTerm = '';

  docUtilWorker: any;

  constructor(
    private translate: TranslateService,
    private gqlService: GqlService,
    private _sanitizer: DomSanitizer,
    private altairConfig: AltairConfig,
  ) {

    // Set translations
    this.translate.get('DOCS_SEARCH_INPUT_PLACEHOLDER_TEXT')
    .pipe(untilDestroyed(this))
    .subscribe(text => this.searchInputPlaceholder = text);

    this.setDocViewChange.subscribe(() => {
      this.docViewerRef.nativeElement.scrollTop = 0;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is a new schema, update the editor schema
    if (changes.gqlSchema && changes.gqlSchema.currentValue) {
      // const schema = changes.gqlSchema.currentValue;
      this.gqlSchema = changes.gqlSchema.currentValue;
      this.updateDocs(changes.gqlSchema.currentValue);
    }
  }

  async updateDocs(schema: GraphQLSchema) {
    debug.log(schema);
    this.rootTypes = getRootTypes(schema);

    try {
      const docUtilWorker = await this.getDocUtilsWorker();
      const sdl = await this.gqlService.getSDL(schema);
      await docUtilWorker.updateSchema(sdl);
      // this.generateIndex(schema);
      this.index = await this.docUtilWorker.generateSearchIndex();
      debug.log('Worker index:', this.index);
      this.hasSearchIndex = true;
    } catch (err) {
      debug.log('Error while generating index.', err);
      this.hasSearchIndex = false;
    }
  }

  autocompleteSource = (term: string) => from(this.getDocUtilsWorker().then(_ => _.searchDocs(term)));
  autocompleteListFormatter = (data: DocumentIndexEntry) => {
    const html = `
      <div class='doc-viewer-autocomplete-item'>
        ${data.search}
        <span class='doc-viewer-autocomplete-item-field'>${data.cat}</span>
        <span class='doc-viewer-autocomplete-item-description'>${data.description}</span>
      </div>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  };

  searchInputKeyUp(term: string, e: KeyboardEvent) {
    if (e && e.keyCode !== 13) {
      return;
    }

    this.searchDocs(term);
  }

  /**
   * search through the docs for the provided term
   */
  async searchDocs(term: string | { name: string }) {
    if (typeof term !== 'string') {
      term = term.name;
    }

    if (!this.hasSearchIndex) {
      return false;
    }
    this.updateDocHistory();
    this.setDocViewChange.next({ view: 'search' });
    const docUtilWorker = await this.getDocUtilsWorker();
    this.searchResult = await docUtilWorker.searchDocs(term);
    debug.log(this.searchResult);
  }

  /**
   * Cleans out getType() names to contain only the type name itself
   * @param name
   */
  cleanName(name: string) {
    return name.replace(/[\[\]!]/g, '');
  }

  /**
   * Go back through the doc history
   */
  goBack() {
    if (this.docHistory.length) {
      this.setDocViewChange.next(this.docHistory.pop());
    }
  }

  /**
   * Go back to root view
   */
  goHome() {
    this.setDocViewChange.next({ view: 'root' });
    this.docHistory = [];
  }

  /**
   * Update the doc history with the current view
   */
  updateDocHistory() {
    if (this.docView && this.docView.view !== 'search') {
      this.docHistory.push({ ...this.docView });
    }
  }

  /**
   * Updates the doc view for a particular type
   * @param name name of type
   */
  goToType(name: string) {
    this.updateDocHistory();
    this.setDocViewChange.next({ view: 'type', name: name.replace(/[\[\]!]/g, '') });
  }

  /**
   * Updates the doc view for a particular field
   * @param name name of field
   * @param parentType name of parent type of field
   */
  goToField(name: string, parentType: string) {
    this.updateDocHistory();
    this.setDocViewChange.next({ view: 'field', name: name.replace(/[\[\]!]/g, ''), parentType: parentType.replace(/[\[\]!]/g, '') });
  }

  async addToEditor(name: string, parentType: string) {
    if (!this.hasSearchIndex) {
      return false;
    }
    const docUtilsWorker = await this.getDocUtilsWorker();
    const generatedQuery = await docUtilsWorker.generateQuery(name, parentType, {
      tabSize: this.tabSize,
      addQueryDepthLimit: this.addQueryDepthLimit,
    });
    if (generatedQuery) {
      this.addQueryToEditorChange.next(generatedQuery);
    }
  }

  exportSDL() {
    this.exportSDLChange.next();
  }

  async getDocUtilsWorker() {
    if (!this.docUtilWorker) {
      if (DocUtils) {
        this.docUtilWorker = await new DocUtils();
      } else {
        const { DocUtils: ImportedDocUtils } = await import('../doc-utils');
        this.docUtilWorker = new ImportedDocUtils();
      }
    }
    return this.docUtilWorker;
  }

  onResize(resizeFactor: number) {
    this.resizeFactor = resizeFactor;
  }

  rootTypeTrackBy(type: GraphQLObjectType) {
    return type.name;
  }

  ngOnDestroy() {
  }
}
