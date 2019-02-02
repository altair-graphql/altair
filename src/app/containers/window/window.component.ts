
import {distinctUntilChanged, map} from 'rxjs/operators';
import {
  Component,
  ViewChild,
  Input,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as fromHeader from '../../reducers/headers/headers';
import * as fromHistory from '../../reducers/history/history';
import * as fromVariable from '../../reducers/variables/variables';

import * as queryActions from '../../actions/query/query';
import * as headerActions from '../../actions/headers/headers';
import * as variableActions from '../../actions/variables/variables';
import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as docsActions from '../../actions/docs/docs';
import * as layoutActions from '../../actions/layout/layout';
import * as schemaActions from '../../actions/gql-schema/gql-schema';
import * as historyActions from '../../actions/history/history';
import * as windowActions from '../../actions/windows/windows';
import * as collectionActions from '../../actions/collection/collection';

import { QueryService, GqlService, NotifyService } from '../../services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html'
})
export class WindowComponent implements OnInit {
  queryResult$: Observable<any>;
  showDocs$: Observable<boolean>;
  docsIsLoading$: Observable<boolean>;
  headers$: Observable<fromHeader.State>;
  variables$: Observable<fromVariable.State>;
  isLoading$: Observable<boolean>;
  introspection$: Observable<any>;
  allowIntrospection$: Observable<boolean>;
  responseStatus$: Observable<number>;
  responseTime$: Observable<number>;
  responseStatusText$: Observable<string>;
  isSubscribed$: Observable<boolean>;
  subscriptionResponses$: Observable<string[]>;
  selectedOperation$: Observable<string>;
  queryOperations$: Observable<any[]>;

  addQueryDepthLimit$: Observable<number>;
  tabSize$: Observable<number>;

  collections$: Observable<any[]>;

  @Input() windowId: string;

  apiUrl = '';
  httpVerb = '';
  initialQuery = '';
  query = '';
  windowTitle = '';


  newCollectionTitle = '';
  newCollectionQueryTitle = '';

  showHeaderDialog = false;
  showVariableDialog = false;
  showSubscriptionUrlDialog = false;
  showHistoryDialog = false;
  showAddToCollectionDialog = false;

  gqlSchema = null;

  subscriptionUrl = '';
  subscriptionConnectionParams = '';

  historyList: fromHistory.HistoryList = [];


  constructor(
    private queryService: QueryService,
    private gql: GqlService,
    private notifyService: NotifyService,
    private store: Store<fromRoot.State>,
    private vRef: ViewContainerRef
  ) {
  }

  ngOnInit() {
    this.addQueryDepthLimit$ = this.store.pipe(select(state => state.settings.addQueryDepthLimit));
    this.tabSize$ = this.store.pipe(select(state => state.settings.tabSize));
    this.collections$ = this.store.pipe(select(state => state.collection.list));

    this.queryResult$ = this.getWindowState().pipe(select(fromRoot.getQueryResult));
    this.showDocs$ = this.getWindowState().pipe(select(fromRoot.getShowDocs));
    this.docsIsLoading$ = this.getWindowState().pipe(select(fromRoot.getDocsLoading));
    this.headers$ = this.getWindowState().pipe(select(fromRoot.getHeaders));
    this.variables$ = this.getWindowState().pipe(select(fromRoot.getVariables));
    this.isLoading$ = this.getWindowState().pipe(select(fromRoot.getIsLoading));
    this.introspection$ = this.getWindowState().pipe(select(fromRoot.getIntrospection));
    this.allowIntrospection$ = this.getWindowState().pipe(select(fromRoot.allowIntrospection));
    this.responseStatus$ = this.getWindowState().pipe(select(fromRoot.getResponseStatus));
    this.responseTime$ = this.getWindowState().pipe(select(fromRoot.getResponseTime));
    this.responseStatusText$ = this.getWindowState().pipe(select(fromRoot.getResponseStatusText));
    this.isSubscribed$ = this.getWindowState().pipe(select(fromRoot.isSubscribed));
    this.subscriptionResponses$ = this.getWindowState().pipe(select(fromRoot.getSubscriptionResponses));
    this.selectedOperation$ = this.getWindowState().pipe(select(fromRoot.getSelectedOperation));
    this.queryOperations$ = this.getWindowState().pipe(select(fromRoot.getQueryOperations));

    this.store.pipe(
      map(data => data.windows[this.windowId]),
      distinctUntilChanged(),
    )
    .subscribe(data => {
      if (!data) {
        return false;
      }

      this.apiUrl = data.query.url;
      this.query = data.query.query;
      this.httpVerb = data.query.httpVerb;
      this.showHeaderDialog = data.dialogs.showHeaderDialog;
      this.showVariableDialog = data.dialogs.showVariableDialog;
      this.showSubscriptionUrlDialog = data.dialogs.showSubscriptionUrlDialog;
      this.showHistoryDialog = data.dialogs.showHistoryDialog;
      this.showAddToCollectionDialog = data.dialogs.showAddToCollectionDialog;
      this.windowTitle = data.layout.title;

      this.subscriptionUrl = data.query.subscriptionUrl;
      this.subscriptionConnectionParams = data.query.subscriptionConnectionParams || '';
      this.historyList = data.history.list;

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

      this.newCollectionQueryTitle = data.layout.title;
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
    this.store.dispatch(new queryActions.SendQueryRequestAction(this.windowId));
  }

  cancelRequest() {
    this.store.dispatch(new queryActions.CancelQueryRequestAction(this.windowId));
  }

  selectOperation(selectedOperation) {
    this.store.dispatch(new queryActions.SetSelectedOperationAction(this.windowId, { selectedOperation }));
    this.sendRequest();
  }

  startSubscription() {
    this.store.dispatch(new queryActions.StartSubscriptionAction(this.windowId));
  }

  stopSubscription() {
    this.store.dispatch(new queryActions.StopSubscriptionAction(this.windowId));
  }

  clearSubscription() {
    this.store.dispatch(new queryActions.SetSubscriptionResponseListAction(this.windowId, { list: [] }));
  }

  updateQuery(query) {
    this.store.dispatch(new queryActions.SetQueryAction(query, this.windowId));
  }

  toggleHeader(isOpen) {
    if (this.showHeaderDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.windowId));
    }
  }

  toggleVariableDialog(isOpen = undefined) {
    if (this.showVariableDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.windowId));
    }
  }

  toggleSubscriptionUrlDialog(isOpen) {
    if (this.showSubscriptionUrlDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(this.windowId));
    }
  }

  toggleHistoryDialog(isOpen) {
    if (this.showHistoryDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleHistoryDialogAction(this.windowId));
    }
  }

  toggleAddToCollectionDialog(isOpen) {
    if (this.showAddToCollectionDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleAddToCollectionDialogAction(this.windowId));
    }
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

  addFileVariable() {
    this.store.dispatch(new variableActions.AddFileVariableAction(this.windowId));
  }
  updateFileVariableName({ index, name }) {
    this.store.dispatch(new variableActions.UpdateFileVariableNameAction(this.windowId, { index, name }));
  }

  updateFileVariableData({ index, fileData }) {
    this.store.dispatch(new variableActions.UpdateFileVariableDataAction(this.windowId, { index, fileData }));
  }

  deleteFileVariable({ index }) {
    this.store.dispatch(new variableActions.DeleteFileVariableAction(this.windowId, { index }));
  }

  updateSubscriptionUrl(url) {
    this.store.dispatch(new queryActions.SetSubscriptionUrlAction({ subscriptionUrl: url }, this.windowId));
  }
  updateSubscriptionConnectionParams(connectionParams) {
    this.store.dispatch(new queryActions.SetSubscriptionConnectionParamsAction(this.windowId, { connectionParams }));
  }

  addQueryToEditor(queryData: { query: String, meta: any }) {
    // Add the query to what is already in the editor
    this.store.dispatch(new queryActions.SetQueryAction(`${this.query}\n${queryData.query}`, this.windowId));

    // If the query has args
    if (queryData.meta.hasArgs) {
      this.notifyService.warning('Fill in the arguments for the query!');
    }
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

  clearHistory() {
    this.store.dispatch(new historyActions.ClearHistoryAction(this.windowId, {}));
  }

  createCollectionAndSaveQueryToCollection() {
    this.store.dispatch(
      new collectionActions.CreateCollectionAndSaveQueryToCollectionAction({
        collectionTitle: this.newCollectionTitle,
        windowId: this.windowId,
        windowTitle: this.newCollectionQueryTitle
      })
    );

    this.onCloseAddToCollectionDialog();
  }

  saveQueryToCollection(collectionId) {
    this.store.dispatch(new collectionActions.SaveQueryToCollectionAction({
      windowId: this.windowId,
      collectionId,
      windowTitle: this.newCollectionQueryTitle
    }));

    this.onCloseAddToCollectionDialog();
  }

  onCloseAddToCollectionDialog() {
    this.newCollectionTitle = '';
    this.newCollectionQueryTitle = this.windowTitle;
    this.toggleAddToCollectionDialog(false);
  }

  exportSDL() {
    this.store.dispatch(new schemaActions.ExportSDLAction(this.windowId));
  }

  /**
   * Export the data in the current window
   */
  exportWindowData() {
    this.store.dispatch(new windowActions.ExportWindowAction({ windowId: this.windowId }));
  }


  trackByFn(index, item) {
    return index;
  }

  getWindowState(): Observable<fromRoot.PerWindowState> {
    return this.store.pipe(select(fromRoot.selectWindowState(this.windowId)));
  }

  /**
   * Carry out any necessary house cleaning tasks.
   */
  initSetup() {
    this.store.dispatch(new queryActions.SetSubscriptionResponseListAction(this.windowId, { list: [] }));
    this.store.dispatch(new queryActions.StopSubscriptionAction(this.windowId));
  }
}
