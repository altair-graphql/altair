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
import { from } from 'rxjs';

import { debug } from '../../../utils/logger';
import { DomSanitizer } from '@angular/platform-browser';
import * as fromDocs from '../../../store/docs/docs.reducer';

import { UntilDestroy } from '@ngneat/until-destroy';
import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';
import { DocumentIndexEntry } from '../models';
import { fadeInOutAnimationTrigger } from '../../../animations';
import * as Comlink from 'comlink';
import { GqlService } from '../../../services';
import getRootTypes from '../../../utils/get-root-types';
import { DocView } from 'altair-graphql-core/build/types/state/docs.interfaces';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { getDocUtilsWorkerAsyncClass } from './worker-helper';

@UntilDestroy()
@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInOutAnimationTrigger,
  ]
  // styleUrls: ['./doc-viewer.component.scss']
})
export class DocViewerComponent implements OnChanges {

  @Input() gqlSchema: GraphQLSchema;
  @Input() allowIntrospection = true;
  @Input() isLoading = false;
  @Input() addQueryDepthLimit = this.altairConfig.add_query_depth_limit;
  @Input() tabSize = this.altairConfig.tab_size;
  @Input() docView: DocView = {
    view: 'root', // type, field, root, search
    parentType: 'Query', // used by field views
    name: 'FieldName' // identifies type/field
  };
  @Input() lastUpdatedAt: number;

  @Output() toggleDocsChange = new EventEmitter();
  @Output() setDocViewChange = new EventEmitter<Partial<DocView>>();
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

  docHistory: DocView[] = [];

  searchResult: DocumentIndexEntry[] = [];
  searchTerm = '';

  docUtilWorker: any;

  constructor(
    private gqlService: GqlService,
    private _sanitizer: DomSanitizer,
    private altairConfig: AltairConfig,
  ) {}

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

  setDocView(docView: Partial<DocView> | undefined) {
    this.setDocViewChange.next(docView);
    this.docViewerRef.nativeElement.scrollTop = 0;
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
    this.setDocView({ view: 'search' });
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
      this.setDocView(this.docHistory.pop());
    }
  }

  /**
   * Go back to root view
   */
  goHome() {
    this.setDocView({ view: 'root' });
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
    this.setDocView({ view: 'type', name: name.replace(/[\[\]!]/g, '') });
  }

  /**
   * Updates the doc view for a particular field
   * @param name name of field
   * @param parentType name of parent type of field
   */
  goToField(name: string, parentType: string) {
    this.updateDocHistory();
    this.setDocView({ view: 'field', name: name.replace(/[\[\]!]/g, ''), parentType: parentType.replace(/[\[\]!]/g, '') });
  }

  async addToEditor(name: string, parentType: string) {
    if (!this.hasSearchIndex) {
      debug.log('No search index, so cannot add to editor')
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
      try {
        const DocUtils: any = getDocUtilsWorkerAsyncClass();
        this.docUtilWorker = await new DocUtils();
      } catch (error) {
        debug.error('Could not load doc utilsweb worker');
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

  rootTypeTrackBy(index: number, type: GraphQLObjectType) {
    return type.name;
  }
}
