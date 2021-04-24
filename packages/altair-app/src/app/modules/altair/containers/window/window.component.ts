
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import {
  Component,
  ViewChild,
  Input,
  OnInit,
  ViewContainerRef,
  OnDestroy,
  NgZone
} from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../store';
import * as fromHeader from '../../store/headers/headers.reducer';
import * as fromHistory from '../../store/history/history.reducer';
import * as fromVariable from '../../store/variables/variables.reducer';
import * as fromQuery from '../../store/query/query.reducer';
import * as fromCollection from '../../store/collection/collection.reducer';
import * as fromPreRequest from '../../store/pre-request/pre-request.reducer';
import * as fromPostRequest from '../../store/post-request/post-request.reducer';
import * as fromDocs from '../../store/docs/docs.reducer';
import * as fromLayout from '../../store/layout/layout.reducer';

import * as queryActions from '../../store/query/query.action';
import * as headerActions from '../../store/headers/headers.action';
import * as variableActions from '../../store/variables/variables.action';
import * as dialogsActions from '../../store/dialogs/dialogs.action';
import * as docsActions from '../../store/docs/docs.action';
import * as layoutActions from '../../store/layout/layout.action';
import * as schemaActions from '../../store/gql-schema/gql-schema.action';
import * as historyActions from '../../store/history/history.action';
import * as windowActions from '../../store/windows/windows.action';
import * as collectionActions from '../../store/collection/collection.action';
import * as streamActions from '../../store/stream/stream.action';
import * as preRequestActions from '../../store/pre-request/pre-request.action';
import * as postRequestActions from '../../store/post-request/post-request.action';

import { GqlService, NotifyService, WindowService, SubscriptionProviderRegistryService } from '../../services';
import { Observable, empty as observableEmpty, EMPTY } from 'rxjs';
import {
  AltairUiAction
} from '../../services/plugin/plugin';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debug } from '../../utils/logger';
import { fadeInOutAnimationTrigger } from '../../animations';
import { IDictionary } from '../../interfaces/shared';
import collectVariables from 'codemirror-graphql/utils/collectVariables';
import { WEBSOCKET_PROVIDER_ID } from '../../services/subscriptions/subscription-provider-registry.service';
import { PerWindowState, RootState } from '../../store/state.interfaces';
import { QueryEditorState, QueryState, SelectedOperation, SubscriptionResponse } from '../../store/query/query.interfaces';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  animations: [
    fadeInOutAnimationTrigger,
  ]
})
export class WindowComponent implements OnInit {
  query$: Observable<QueryState>;
  queryResult$: Observable<any>;
  showDocs$: Observable<boolean>;
  docView$: Observable<any>;
  docsIsLoading$: Observable<boolean>;
  headers$: Observable<fromHeader.State>;
  variables$: Observable<fromVariable.State>;
  introspection$: Observable<any>;
  allowIntrospection$: Observable<boolean>;
  schemaLastUpdatedAt$: Observable<number | undefined>;
  responseStatus$: Observable<number>;
  responseTime$: Observable<number>;
  responseStatusText$: Observable<string>;
  responseHeaders$: Observable<IDictionary | undefined>;
  isSubscribed$: Observable<boolean>;
  subscriptionResponses$: Observable<SubscriptionResponse[]>;
  selectedOperation$?: Observable<SelectedOperation>;
  queryOperations$: Observable<any[]>;
  streamState$: Observable<'connected' | 'failed' | 'uncertain' | ''>;
  currentCollection$: Observable<fromCollection.IQueryCollection | undefined>;
  preRequest$: Observable<fromPreRequest.State>;
  postRequest$: Observable<fromPostRequest.State>;
  layout$: Observable<fromLayout.State>;

  addQueryDepthLimit$: Observable<number>;
  tabSize$: Observable<number>;
  autoscrollSubscriptionResponses$: Observable<boolean>;

  collections$: Observable<fromCollection.IQueryCollection[]>;

  resultPaneUiActions$: Observable<AltairUiAction[]>;

  @Input() windowId: string;

  apiUrl = '';
  query = '';

  showHeaderDialog = false;
  showVariableDialog = false;
  showSubscriptionUrlDialog = false;
  showHistoryDialog = false;
  showAddToCollectionDialog = false;
  showPreRequestDialog = true;

  gqlSchema: any = null;

  variableToType: IDictionary;

  subscriptionUrl = '';
  subscriptionConnectionParams = '';
  availableSubscriptionProviders = this.subscriptionProviderRegistry.getAllProviderData();
  selectedSubscriptionProviderId = '';

  historyList: fromHistory.History[] = [];

  constructor(
    private gql: GqlService,
    private notifyService: NotifyService,
    private store: Store<RootState>,
    private windowService: WindowService,
    private subscriptionProviderRegistry: SubscriptionProviderRegistryService,
  ) {
  }

  ngOnInit() {
    this.addQueryDepthLimit$ = this.store.pipe(select(state => state.settings.addQueryDepthLimit));
    this.tabSize$ = this.store.pipe(select(state => state.settings.tabSize));
    this.collections$ = this.store.pipe(select(state => state.collection.list));

    this.query$ = this.getWindowState().pipe(select(fromRoot.getQueryState));
    this.queryResult$ = this.getWindowState().pipe(select(fromRoot.getQueryResult));
    this.showDocs$ = this.getWindowState().pipe(select(fromRoot.getShowDocs));
    this.docView$ = this.getWindowState().pipe(select(fromRoot.getDocView));
    this.docsIsLoading$ = this.getWindowState().pipe(select(fromRoot.getDocsLoading));
    this.headers$ = this.getWindowState().pipe(select(fromRoot.getHeaders));
    this.variables$ = this.getWindowState().pipe(select(fromRoot.getVariables));
    this.introspection$ = this.getWindowState().pipe(select(fromRoot.getIntrospection));
    this.allowIntrospection$ = this.getWindowState().pipe(select(fromRoot.allowIntrospection));
    this.schemaLastUpdatedAt$ = this.getWindowState().pipe(select(fromRoot.getSchemaLastUpdatedAt));
    this.responseStatus$ = this.getWindowState().pipe(select(fromRoot.getResponseStatus));
    this.responseTime$ = this.getWindowState().pipe(select(fromRoot.getResponseTime));
    this.responseStatusText$ = this.getWindowState().pipe(select(fromRoot.getResponseStatusText));
    this.responseHeaders$ = this.getWindowState().pipe(select(fromRoot.getResponseHeaders));
    this.isSubscribed$ = this.getWindowState().pipe(select(fromRoot.isSubscribed));
    this.subscriptionResponses$ = this.getWindowState().pipe(select(fromRoot.getSubscriptionResponses));
    this.autoscrollSubscriptionResponses$ = this.getWindowState().pipe(select(fromRoot.getAutoscrollSubscriptionResponse));
    this.selectedOperation$ = this.getWindowState().pipe(select(fromRoot.getSelectedOperation));
    this.queryOperations$ = this.getWindowState().pipe(select(fromRoot.getQueryOperations));
    this.streamState$ = this.getWindowState().pipe(select(fromRoot.getStreamStateString));
    this.currentCollection$ = this.getWindowState().pipe(
      switchMap(data => {
        if (data && data.layout.collectionId) {
          return this.collections$.pipe(
            map(collections => {
              return collections.find(collection => collection.id === data.layout.collectionId);
            })
          );
        }

        return EMPTY;
      })
    );
    this.preRequest$ = this.getWindowState().pipe(select(fromRoot.getPreRequest));
    this.postRequest$ = this.getWindowState().pipe(select(fromRoot.getPostRequest));
    this.layout$ = this.getWindowState().pipe(select(fromRoot.getLayout));

    this.resultPaneUiActions$ = this.store.select(fromRoot.getResultPaneUiActions);

    this.store.pipe(
      untilDestroyed(this),
      map(data => data.windows[this.windowId]),
      distinctUntilChanged(),
    )
    .subscribe(data => {
      if (!data) {
        return false;
      }
      const previousQuery = this.query;

      this.apiUrl = data.query.url;
      const query = data.query.query || '';
      this.query = query;
      this.showHeaderDialog = data.dialogs.showHeaderDialog;
      this.showVariableDialog = data.dialogs.showVariableDialog;
      this.showSubscriptionUrlDialog = data.dialogs.showSubscriptionUrlDialog;
      this.showHistoryDialog = data.dialogs.showHistoryDialog;
      this.showAddToCollectionDialog = data.dialogs.showAddToCollectionDialog;
      this.showPreRequestDialog = data.dialogs.showPreRequestDialog;

      this.subscriptionUrl = data.query.subscriptionUrl;
      this.subscriptionConnectionParams = data.query.subscriptionConnectionParams || '';
      this.selectedSubscriptionProviderId = data.query.subscriptionProviderId || WEBSOCKET_PROVIDER_ID;
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

      if (previousQuery !== this.query && this.gqlSchema) {
        try {
          this.variableToType = collectVariables(this.gqlSchema, this.gql.parseQuery(query));
        } catch (error) {}
      }
    });

    this.windowService.setupWindow(this.windowId);
  }

  setApiUrl(url: string) {
    if (url !== this.apiUrl) {
      this.store.dispatch(new queryActions.SetUrlAction({ url }, this.windowId));
      this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.windowId));
    }
  }

  setApiMethod(httpVerb: string) {
    this.store.dispatch(new queryActions.SetHTTPMethodAction({ httpVerb }, this.windowId));
  }

  sendRequest(opts: any = {}) {
    if (opts.operationName) {
      this.store.dispatch(new queryActions.SetSelectedOperationAction(this.windowId, { selectedOperation: opts.operationName }));
    }
    this.store.dispatch(new queryActions.SendQueryRequestAction(this.windowId));
  }

  cancelRequest() {
    this.store.dispatch(new queryActions.CancelQueryRequestAction(this.windowId));
  }

  selectOperation(selectedOperation: string) {
    this.store.dispatch(new queryActions.SetSelectedOperationAction(this.windowId, { selectedOperation }));
    this.sendRequest();
  }

  setQueryEditorState(queryEditorState: QueryEditorState) {
    this.store.dispatch(new queryActions.SetQueryEditorStateAction(this.windowId, queryEditorState));
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

  toggleAutoscrollSubscriptionResponses() {
    this.store.dispatch(new queryActions.ToggleAutoscrollSubscriptionResponseAction(this.windowId));
  }

  updateQuery(query: string) {
    this.store.dispatch(new queryActions.SetQueryAction(query, this.windowId));
  }

  toggleHeader(isOpen = undefined) {
    if (this.showHeaderDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction(this.windowId));
    }
  }

  toggleVariableDialog(isOpen = undefined) {
    if (this.showVariableDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleVariableDialogAction(this.windowId));
    }
  }

  toggleSubscriptionUrlDialog(isOpen: boolean) {
    if (this.showSubscriptionUrlDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(this.windowId));
    }
  }

  toggleHistoryDialog(isOpen: boolean) {
    if (this.showHistoryDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleHistoryDialogAction(this.windowId));
    }
  }

  toggleAddToCollectionDialog(isOpen: boolean) {
    if (this.showAddToCollectionDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.ToggleAddToCollectionDialogAction(this.windowId));
    }
  }

  togglePreRequestDialog(isOpen: boolean) {
    if (this.showPreRequestDialog !== isOpen) {
      this.store.dispatch(new dialogsActions.TogglePreRequestDialogAction(this.windowId));
    }
  }

  setDocView(docView: fromDocs.DocView) {
    this.store.dispatch(new docsActions.SetDocViewAction(this.windowId, { docView }))
  }
  onShowTokenInDocs(docView: fromDocs.DocView) {
    this.setDocView(docView);
    this.showDocs$.pipe(
      take(1),
      untilDestroyed(this),
    ).subscribe({
      next: docsShown => {
        if (!docsShown) {
          this.toggleDocs();
        }
      },
    });
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

  headerKeyChange(val: string, i: number) {
    this.store.dispatch(new headerActions.EditHeaderKeyAction({ val, i }, this.windowId));
  }
  headerValueChange(val: string, i: number) {
    this.store.dispatch(new headerActions.EditHeaderValueAction({ val, i }, this.windowId));
  }

  headerEnabledChange(val: boolean, i: number) {
    this.store.dispatch(new headerActions.EditHeaderEnabledAction({ val, i }, this.windowId));
  }

  removeHeader(i: number) {
    this.store.dispatch(new headerActions.RemoveHeaderAction(i, this.windowId));
  }

  updateVariables(variables: string) {
    this.store.dispatch(new variableActions.UpdateVariablesAction(variables, this.windowId));
  }

  addFileVariable() {
    this.store.dispatch(new variableActions.AddFileVariableAction(this.windowId));
  }
  updateFileVariableName({ index, name }: { index: number, name: string }) {
    this.store.dispatch(new variableActions.UpdateFileVariableNameAction(this.windowId, { index, name }));
  }

  updateFileVariableIsMultiple({ index, isMultiple }: { index: number, isMultiple: boolean }) {
    this.store.dispatch(new variableActions.UpdateFileVariableIsMultipleAction(this.windowId, { index, isMultiple }));
  }

  updateFileVariableData({ index, fileData }: { index: number, fileData: File }) {
    this.store.dispatch(new variableActions.UpdateFileVariableDataAction(this.windowId, { index, fileData }));
  }

  deleteFileVariable({ index }: { index: number }) {
    this.store.dispatch(new variableActions.DeleteFileVariableAction(this.windowId, { index }));
  }

  updateSubscriptionUrl(url: string) {
    this.store.dispatch(new queryActions.SetSubscriptionUrlAction({ subscriptionUrl: url }, this.windowId));
  }
  updateSubscriptionConnectionParams(connectionParams: string) {
    this.store.dispatch(new queryActions.SetSubscriptionConnectionParamsAction(this.windowId, { connectionParams }));
  }
  updateSubscriptionProviderId(providerId: string) {
    this.store.dispatch(new queryActions.SetSubscriptionProviderIdAction(this.windowId, { providerId }));
  }

  updatePreRequestScript(script: string) {
    this.store.dispatch(new preRequestActions.SetPreRequestScriptAction(this.windowId, { script }));
  }

  updatePreRequestEnabled(enabled: boolean) {
    this.store.dispatch(new preRequestActions.SetPreRequestEnabledAction(this.windowId, { enabled }));
  }

  updatePostRequestScript(script: string) {
    this.store.dispatch(new postRequestActions.SetPostRequestScriptAction(this.windowId, { script }));
  }

  updatePostRequestEnabled(enabled: boolean) {
    this.store.dispatch(new postRequestActions.SetPostRequestEnabledAction(this.windowId, { enabled }));
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
  restoreHistory(index: number) {
    if (this.historyList[index]) {
      this.store.dispatch(new queryActions.SetQueryAction(this.historyList[index].query, this.windowId));
    }
  }

  clearHistory() {
    this.store.dispatch(new historyActions.ClearHistoryAction(this.windowId, {}));
  }

  createCollectionAndSaveQueryToCollection({ queryName = '', collectionName = '' }) {
    this.store.dispatch(
      new collectionActions.CreateCollectionAndSaveQueryToCollectionAction({
        collectionTitle: collectionName,
        windowId: this.windowId,
        windowTitle: queryName,
      })
    );

    this.onCloseAddToCollectionDialog();
  }

  saveQueryToCollection({ queryName = '', collectionId = 0 }) {
    this.store.dispatch(new collectionActions.SaveQueryToCollectionAction({
      windowId: this.windowId,
      collectionId,
      windowTitle: queryName,
    }));

    this.onCloseAddToCollectionDialog();
  }

  updateQueryInCollection() {
    this.store.dispatch(new collectionActions.UpdateQueryInCollectionAction({ windowId: this.windowId }));
  }

  onCloseAddToCollectionDialog() {
    this.toggleAddToCollectionDialog(false);
  }

  exportSDL() {
    this.store.dispatch(new schemaActions.ExportSDLAction(this.windowId));
  }

  loadSchemaFromSDL() {
    this.store.dispatch(new schemaActions.LoadSDLSchemaAction(this.windowId));
  }

  onExecuteUiAction(uiAction: AltairUiAction) {
    uiAction.execute();
  }

  /**
   * Export the data in the current window
   */
  exportWindowData() {
    this.store.dispatch(new windowActions.ExportWindowAction({ windowId: this.windowId }));
  }


  trackByFn(index: number) {
    return index;
  }

  getWindowState(): Observable<PerWindowState> {
    return this.store.pipe(select(fromRoot.selectWindowState(this.windowId)));
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
