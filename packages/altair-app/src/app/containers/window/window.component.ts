
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
import * as fromDocs from '../../store/docs/docs.reducer';

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

import { GqlService, NotifyService, PluginRegistryService, WindowService } from '../../services';
import { Observable, empty as observableEmpty, combineLatest } from 'rxjs';
import {
  PluginComponentData,
  PluginInstance,
  PluginType,
  PluginTypeActionButtonLocation,
  ActionPlugin,
  ActionPluginRenderOutput
} from '../../services/plugin/plugin';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { debug } from 'app/utils/logger';
import { fadeInOutAnimationTrigger } from 'app/animations';
import { getActionPluginClass } from 'app/services/plugin/plugin-utils';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  animations: [
    fadeInOutAnimationTrigger,
  ]
})
export class WindowComponent implements OnInit, OnDestroy {
  queryResult$: Observable<any>;
  showDocs$: Observable<boolean>;
  docView$: Observable<any>;
  docsIsLoading$: Observable<boolean>;
  headers$: Observable<fromHeader.State>;
  variables$: Observable<fromVariable.State>;
  isLoading$: Observable<boolean>;
  introspection$: Observable<any>;
  allowIntrospection$: Observable<boolean>;
  schemaLastUpdatedAt$: Observable<number | undefined>;
  responseStatus$: Observable<number>;
  responseTime$: Observable<number>;
  responseStatusText$: Observable<string>;
  isSubscribed$: Observable<boolean>;
  subscriptionResponses$: Observable<fromQuery.SubscriptionResponse[]>;
  selectedOperation$?: Observable<fromQuery.SelectedOperation>;
  queryOperations$: Observable<any[]>;
  streamState$: Observable<'connected' | 'failed' | 'uncertain' | ''>;
  currentCollection$: Observable<fromCollection.IQueryCollection | undefined>;
  preRequest$: Observable<fromPreRequest.State>;

  addQueryDepthLimit$: Observable<number>;
  tabSize$: Observable<number>;
  autoscrollSubscriptionResponses$: Observable<boolean>;

  collections$: Observable<fromCollection.IQueryCollection[]>;

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
  showPreRequestDialog = true;

  gqlSchema: any = null;

  subscriptionUrl = '';
  subscriptionConnectionParams = '';

  historyList: fromHistory.HistoryList = [];
  pluginsData: PluginComponentData[] = [];
  resultPaneActionButtonPlugins: { pluginName: string, instance: ActionPlugin, data: PluginComponentData['props']}[] = [];
  resultPaneActionButtonRenderOutputs: ActionPluginRenderOutput[] = [];

  constructor(
    private gql: GqlService,
    private notifyService: NotifyService,
    private store: Store<fromRoot.State>,
    private windowService: WindowService,
    private vRef: ViewContainerRef,
    private pluginRegistry: PluginRegistryService,
    private zone: NgZone,
  ) {
  }

  ngOnInit() {
    this.addQueryDepthLimit$ = this.store.pipe(select(state => state.settings.addQueryDepthLimit));
    this.tabSize$ = this.store.pipe(select(state => state.settings.tabSize));
    this.collections$ = this.store.pipe(select(state => state.collection.list));

    this.queryResult$ = this.getWindowState().pipe(select(fromRoot.getQueryResult));
    this.showDocs$ = this.getWindowState().pipe(select(fromRoot.getShowDocs));
    this.docView$ = this.getWindowState().pipe(select(fromRoot.getDocView));
    this.docsIsLoading$ = this.getWindowState().pipe(select(fromRoot.getDocsLoading));
    this.headers$ = this.getWindowState().pipe(select(fromRoot.getHeaders));
    this.variables$ = this.getWindowState().pipe(select(fromRoot.getVariables));
    this.isLoading$ = this.getWindowState().pipe(select(fromRoot.getIsLoading));
    this.introspection$ = this.getWindowState().pipe(select(fromRoot.getIntrospection));
    this.allowIntrospection$ = this.getWindowState().pipe(select(fromRoot.allowIntrospection));
    this.schemaLastUpdatedAt$ = this.getWindowState().pipe(select(fromRoot.getSchemaLastUpdatedAt));
    this.responseStatus$ = this.getWindowState().pipe(select(fromRoot.getResponseStatus));
    this.responseTime$ = this.getWindowState().pipe(select(fromRoot.getResponseTime));
    this.responseStatusText$ = this.getWindowState().pipe(select(fromRoot.getResponseStatusText));
    this.isSubscribed$ = this.getWindowState().pipe(select(fromRoot.isSubscribed));
    this.subscriptionResponses$ = this.getWindowState().pipe(select(fromRoot.getSubscriptionResponses));
    this.autoscrollSubscriptionResponses$ = this.getWindowState().pipe(select(fromRoot.getAutoscrollSubscriptionResponse));
    this.selectedOperation$ = this.getWindowState().pipe(select(fromRoot.getSelectedOperation));
    this.queryOperations$ = this.getWindowState().pipe(select(fromRoot.getQueryOperations));
    this.streamState$ = this.getWindowState().pipe(
      map(data => {
        if (data && data.stream.url) {
          if (data.stream.isConnected && data.stream.client instanceof EventSource) {
            return 'connected';
          }
          return 'uncertain';
        }
        return '';
      })
    );
    this.currentCollection$ = this.getWindowState().pipe(
      switchMap(data => {
        if (data && data.layout.collectionId) {
          return this.collections$.pipe(
            map(collections => {
              return collections.find(collection => collection.id === data.layout.collectionId);
            })
          );
        }

        return observableEmpty();
      })
    );
    this.preRequest$ = this.getWindowState().pipe(select(fromRoot.getPreRequest));

    this.store.pipe(
      map(data => data.windows[this.windowId]),
      distinctUntilChanged(),
      untilDestroyed(this),
    )
    .subscribe(data => {
      if (!data) {
        return false;
      }

      this.apiUrl = data.query.url;
      this.query = data.query.query || '';
      this.httpVerb = data.query.httpVerb;
      this.showHeaderDialog = data.dialogs.showHeaderDialog;
      this.showVariableDialog = data.dialogs.showVariableDialog;
      this.showSubscriptionUrlDialog = data.dialogs.showSubscriptionUrlDialog;
      this.showHistoryDialog = data.dialogs.showHistoryDialog;
      this.showAddToCollectionDialog = data.dialogs.showAddToCollectionDialog;
      this.showPreRequestDialog = data.dialogs.showPreRequestDialog;
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
    });

    this.store.pipe(
      take(1),
      untilDestroyed(this),
    )
    .subscribe(data => {
      if (data.settings.enableExperimental) {
        this.pluginRegistry.getPluginsWithData(PluginType.SIDEBAR, { windowId: this.windowId }).subscribe(pluginsData => {
          this.pluginsData = pluginsData;
        });

        this.pluginRegistry.getPluginsWithData(PluginType.ACTION_BUTTON, { windowId: this.windowId }).subscribe(async(pluginsData) => {
          // TODO: Consider moving most of this logic out of the window component
          // Instantiate the plugin classes
          this.resultPaneActionButtonPlugins = pluginsData.map(pluginData => {
            if (
              pluginData.manifest.action_button_opts &&
              pluginData.manifest.action_button_opts.location === PluginTypeActionButtonLocation.RESULT_PANE
            ) {
              const PluginClass = getActionPluginClass(pluginData);
              if (PluginClass) {
                return { pluginName: pluginData.name, instance: new PluginClass(pluginData.props), data: pluginData.props };
              }
            }
          }).filter(Boolean) as any;

          // Render the action button outputs
          const resultPaneRenderOutputPromises = this.resultPaneActionButtonPlugins.map(async actionButtonPlugin => {
            const output = await actionButtonPlugin.instance.render(actionButtonPlugin.data);
            return ({ ...output, instance: actionButtonPlugin.instance, pluginName: actionButtonPlugin.pluginName });
          });

          this.resultPaneActionButtonRenderOutputs = await Promise.all(resultPaneRenderOutputPromises);
        });
        // TODO: Call destroy method on each plugin instance
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

  setQueryEditorState(queryEditorState: fromQuery.QueryEditorState) {
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
    ).subscribe(docsShown => {
      if (!docsShown) {
        this.toggleDocs();
      }
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

  updatePreRequestScript(script: string) {
    this.store.dispatch(new preRequestActions.SetPreRequestScriptAction(this.windowId, { script }));
  }

  updatePreRequestEnabled(enabled: boolean) {
    this.store.dispatch(new preRequestActions.SetPreRequestEnabledAction(this.windowId, { enabled }));
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

  saveQueryToCollection(collectionId: number) {
    this.store.dispatch(new collectionActions.SaveQueryToCollectionAction({
      windowId: this.windowId,
      collectionId,
      windowTitle: this.newCollectionQueryTitle
    }));

    this.onCloseAddToCollectionDialog();
  }

  updateQueryInCollection() {
    this.store.dispatch(new collectionActions.UpdateQueryInCollectionAction({ windowId: this.windowId }));
  }

  onCloseAddToCollectionDialog() {
    this.newCollectionTitle = '';
    this.newCollectionQueryTitle = this.windowTitle;
    this.toggleAddToCollectionDialog(false);
  }

  exportSDL() {
    this.store.dispatch(new schemaActions.ExportSDLAction(this.windowId));
  }

  loadSchemaFromSDL() {
    this.store.dispatch(new schemaActions.LoadSDLSchemaAction(this.windowId));
  }

  onActionButtonClicked(button: ActionPluginRenderOutput) {
    const abPlugin = this.resultPaneActionButtonPlugins.find(_abPlugin => _abPlugin.pluginName === button.pluginName);
    if (abPlugin) {
      // Call execute on plugin instance
      abPlugin.instance.execute(abPlugin.data);
    }
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

  getWindowState(): Observable<fromRoot.PerWindowState> {
    return this.store.pipe(select(fromRoot.selectWindowState(this.windowId)));
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  pluginTrackBy(index: number, plugin: PluginInstance) {
    return plugin.name;
  }

  ngOnDestroy() {}
}
