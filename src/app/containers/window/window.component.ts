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
import * as fromHistory from '../../reducers/history/history';

import * as queryActions from '../../actions/query/query';
import * as headerActions from '../../actions/headers/headers';
import * as variableActions from '../../actions/variables/variables';
import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as docsActions from '../../actions/docs/docs';
import * as layoutActions from '../../actions/layout/layout';
import * as schemaActions from '../../actions/gql-schema/gql-schema';
import * as historyActions from '../../actions/history/history';

import { QueryService, GqlService, NotifyService } from '../../services';
import { graphql } from 'graphql';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html'
})
export class WindowComponent implements OnInit {
  apiUrl$;

  @Input() windowId: string;

  apiUrl = '';
  httpVerb = '';
  initialQuery = '';
  query = '';
  queryResult = '';

  showHeaderDialog = false;
  showVariableDialog = false;
  showSubscriptionUrlDialog = false;
  showHistoryDialog = false;

  showDocs = true;
  docsIsLoading = false;
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

  subscriptionUrl = '';
  isSubscribed = false;
  subscriptionResponses = [];

  historyList: fromHistory.HistoryList = [];

  collapsed = true;

  constructor(
    private queryService: QueryService,
    private gql: GqlService,
    private notifyService: NotifyService,
    private store: Store<fromRoot.State>,
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
        this.httpVerb = data.query.httpVerb;
        this.queryResult = data.query.response;
        this.headers = data.headers;
        this.showHeaderDialog = data.dialogs.showHeaderDialog;
        this.showVariableDialog = data.dialogs.showVariableDialog;
        this.showSubscriptionUrlDialog = data.dialogs.showSubscriptionUrlDialog;
        this.showHistoryDialog = data.dialogs.showHistoryDialog;
        this.introspectionResult = data.schema.introspection;

        this.variables = data.variables.variables;
        this.showDocs = data.docs.showDocs;
        this.isLoading = data.layout.isLoading;
        this.docsIsLoading = data.docs.isLoading;
        this.showUrlAlert = data.query.showUrlAlert;
        this.urlAlertMessage = data.query.urlAlertMessage;
        this.urlAlertSuccess = data.query.urlAlertSuccess;
        this.allowIntrospection = data.schema.allowIntrospection;
        this.responseStatus = data.query.responseStatus;
        this.responseTime = data.query.responseTime;
        this.responseStatusText = data.query.responseStatusText;
        this.subscriptionUrl = data.query.subscriptionUrl;
        this.isSubscribed = data.query.isSubscribed;
        this.subscriptionResponses = data.query.subscriptionResponseList;
        if (data.history) { // Remove condition when all users have upgraded to v1.6.0+
          this.historyList = data.history.list;
        }

        this.showEditorAlert = data.query.showEditorAlert;
        this.editorAlertMessage = data.query.editorAlertMessage;
        this.editorAlertSuccess = data.query.editorAlertSuccess;

        // Schema needs to be valid instances of GQLSchema.
        // Rehydrated schema objects are not valid, so we get the schema again.
        if (this.gql.isSchema(data.schema.schema)) {
          this.gqlSchema = data.schema.schema;
        } else {
          const schema = this.gql.getIntrospectionSchema(data.schema.introspection);
          if (schema) {
            this.store.dispatch(new schemaActions.SetSchemaAction(this.windowId, schema));
          }
        }

        // Backward compatibility: set the HTTP verb if it is not set.
        if (!this.httpVerb) {
          this.store.dispatch(new queryActions.SetHTTPMethodAction({ httpVerb: 'POST' }, this.windowId));
        }
        // console.log(data.query);
      });

    this.queryService.loadQuery(this.windowId);
    this.queryService.loadUrl(this.windowId);

    this.initSetup();
  }

  setApiUrl(url) {
    if (url !== this.apiUrl) {
      this.store.dispatch(new queryActions.SetUrlAction({ url }, this.windowId));
      this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.windowId));
    }
  }

  setApiMethod(httpVerb) {
    this.store.dispatch(new queryActions.SetHTTPMethodAction({ httpVerb }, this.windowId));
  }

  sendRequest() {
    // Store the current query into the history if it does not already exist in the history
    if (!this.historyList.filter(item => item.query.trim() === this.query.trim()).length) {
      this.store.dispatch(new historyActions.AddHistoryAction(this.windowId, { query: this.query }));
    }

    // If the query is a subscription, subscribe to the subscription URL and send the query
    if (this.gql.isSubscriptionQuery(this.query)) {
      console.log('Your query is a SUBSCRIPTION!!!');
      // If the subscription URL is not set, show the dialog for the user to set it
      if (!this.subscriptionUrl) {
        this.toggleSubscriptionUrlDialog();
      } else {
        this.startSubscription();
      }
    } else {
      this.store.dispatch(new queryActions.SendQueryRequestAction(this.windowId));
    }
  }

  cancelRequest() {
    this.store.dispatch(new queryActions.CancelQueryRequestAction(this.windowId));
  }

  startSubscription() {
    this.store.dispatch(new queryActions.StartSubscriptionAction(this.windowId));
  }

  stopSubscription() {
    this.store.dispatch(new queryActions.StopSubscriptionAction(this.windowId));
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

  toggleSubscriptionUrlDialog() {
    this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(this.windowId));
  }

  toggleHistoryDialog() {
    this.store.dispatch(new dialogsActions.ToggleHistoryDialogAction(this.windowId));
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

  updateSubscriptionUrl(url) {
    this.store.dispatch(new queryActions.SetSubscriptionUrlAction({ subscriptionUrl: url }, this.windowId));
  }

  prettifyCode() {
    this.store.dispatch(new queryActions.PrettifyQueryAction(this.windowId));
  }

  addQueryToEditor(queryData: { query: String, meta: any }) {
    // Add the query to what is already in the editor
    this.store.dispatch(new queryActions.SetQueryAction(`${this.query}\n${queryData.query}`, this.windowId));
    this.store.dispatch(new layoutActions.NotifyExperimentalAction(this.windowId));

    // If the query has args
    if (queryData.meta.hasArgs) {
      this.notifyService.warning('Fill in the arguments for the query!');
    }
  }

  clearEditor() {
    this.store.dispatch(new queryActions.SetQueryAction(``, this.windowId));
  }

  downloadResult() {
    this.store.dispatch(new queryActions.DownloadResultAction(this.windowId));
  }

  // Set the value of the item in the specified index of the history list
  restoreHistory(index) {
    if (this.historyList[index]) {
      this.store.dispatch(new queryActions.SetQueryAction(this.historyList[index].query, this.windowId));
    }
  }

  trackByFn(index, item) {
    return index;
  }

  /**
   * Carry out any necessary house cleaning tasks.
   */
  initSetup() {
    this.store.dispatch(new queryActions.SetSubscriptionResponseListAction(this.windowId, { list: [] }));
    this.store.dispatch(new queryActions.StopSubscriptionAction(this.windowId));
  }
}
