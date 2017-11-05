import {
  Component,
  ViewChild,
  Input,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import * as fromRoot from '../../reducers';
import * as fromHeader from '../../reducers/headers/headers';
import * as fromVariable from '../../reducers/variables/variables';

import * as queryActions from '../../actions/query/query';
import * as headerActions from '../../actions/headers/headers';
import * as variableActions from '../../actions/variables/variables';
import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as docsActions from '../../actions/docs/docs';

import { QueryService } from '../../services/query.service';
import { GqlService } from '../../services/gql.service';
import { graphql } from 'graphql';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
  apiUrl$;

  @Input() windowId: string;

  @ViewChild('urlInput') urlInput;

  apiUrl = '';
  initialQuery = '';
  query = '';
  queryResult = '';
  showHeaderDialog = false;
  showVariableDialog = false;
  showDocs = true;
  headers: fromHeader.State = [];
  variables = '';
  introspectionResult = {};
  gqlSchema = null;

  showUrlAlert = false;
  urlAlertMessage = '';
  urlAlertSuccess = false;

  showEditorAlert = false;
  editorAlertMessage = '';
  editorAlertSuccess = false;

  isLoading = false;

  allowIntrospection = true;

  responseTime = 0;
  responseStatus = 0;
  responseStatusText = '';

  constructor(
    private queryService: QueryService,
    private gql: GqlService,
    private store: Store<any>,
    private toastr: ToastsManager,
    private vRef: ViewContainerRef
  ) {

    // Required by the notify service
    this.toastr.setRootViewContainerRef(this.vRef);
  }

  ngOnInit() {
    // this.apiUrl$ = this.store.select(fromRoot.getUrl);
    this.store
      .map(data => data.windows[this.windowId])
      .distinctUntilChanged()
      .subscribe(data => {
        if (!data) {
          return false;
        }

        this.apiUrl = data.query.url;
        this.query = data.query.query;
        this.queryResult = data.query.response;
        this.headers = data.headers;
        this.showHeaderDialog = data.dialogs.showHeaderDialog;
        this.showVariableDialog = data.dialogs.showVariableDialog;
        this.introspectionResult = data.schema.introspection;
        this.gqlSchema = data.schema.schema;
        this.variables = data.variables.variables;
        this.showDocs = data.docs.showDocs;
        this.isLoading = data.layout.isLoading;
        this.showUrlAlert = data.query.showUrlAlert;
        this.urlAlertMessage = data.query.urlAlertMessage;
        this.urlAlertSuccess = data.query.urlAlertSuccess;
        this.allowIntrospection = data.schema.allowIntrospection;
        this.responseStatus = data.query.responseStatus;
        this.responseTime = data.query.responseTime;
        this.responseStatusText = data.query.responseStatusText;

        this.showEditorAlert = data.query.showEditorAlert;
        this.editorAlertMessage = data.query.editorAlertMessage;
        this.editorAlertSuccess = data.query.editorAlertSuccess;
        // console.log(data.query);
      });

    this.queryService.loadQuery(this.windowId);
    this.queryService.loadUrl(this.windowId);

    // Introspection needs to be pulled from the db for the schema (which is dynamic) to be updated
    this.queryService.loadIntrospection(this.windowId);
  }

  setApiUrl() {
    const url = this.urlInput.nativeElement.value;
    this.store.dispatch(new queryActions.SetUrlAction(url, this.windowId));
    this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.windowId));
  }

  sendRequest() {
    this.store.dispatch(new queryActions.SendQueryRequestAction(this.windowId));
  }

  cancelRequest() {
    this.store.dispatch(new queryActions.CancelQueryRequestAction(this.windowId));
  }

  updateQuery(query) {
    this.store.dispatch(new queryActions.SetQueryAction(query, this.windowId));
  }

  toggleHeader() {
    this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.windowId));
  }

  toggleVariableDialog() {
    this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.windowId));
  }

  toggleDocs() {
    this.store.dispatch(new docsActions.ToggleDocsViewAction(this.windowId));
  }

  reloadDocs() {
    this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.windowId));
  }

  addHeader() {
    this.store.dispatch(new headerActions.AddHeaderAction(this.windowId));
  }

  headerKeyChange($event, i) {
    const val = $event.target.value;
    this.store.dispatch(new headerActions.EditHeaderKeyAction({ val, i }, this.windowId));
  }
  headerValueChange($event, i) {
    const val = $event.target.value;
    this.store.dispatch(new headerActions.EditHeaderValueAction({ val, i }, this.windowId));
  }

  removeHeader(i) {
    this.store.dispatch(new headerActions.RemoveHeaderAction(i, this.windowId));
  }

  updateVariables(variables) {
    this.store.dispatch(new variableActions.UpdateVariablesAction(variables, this.windowId));
  }

  prettifyCode() {
    this.store.dispatch(new queryActions.PrettifyQueryAction(this.windowId));
  }

  addQueryToEditor(queryData: { query: String, meta: any }) {
    // Add the query to what is already in the editor
    this.store.dispatch(new queryActions.SetQueryAction(`${this.query}\n${queryData.query}`, this.windowId));

    // If the query has args
    if (queryData.meta.hasArgs) {
      const opts = {
          message: 'Fill in the arguments for the query!',
          success: false
      };
      this.store.dispatch(new queryActions.ShowEditorAlertAction(opts, this.windowId));
    }
  }

  clearEditor() {
    this.store.dispatch(new queryActions.SetQueryAction(``, this.windowId));
  }

  trackByFn(index, item) {
    return index;
  }
}
