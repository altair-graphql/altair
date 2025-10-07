import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';
import { Store, createSelector, select } from '@ngrx/store';

import * as fromRoot from '../../store';

import * as queryActions from '../../store/query/query.action';
import * as headerActions from '../../store/headers/headers.action';
import * as variableActions from '../../store/variables/variables.action';
import * as dialogsActions from '../../store/dialogs/dialogs.action';
import * as docsActions from '../../store/docs/docs.action';
import * as schemaActions from '../../store/gql-schema/gql-schema.action';
import * as historyActions from '../../store/history/history.action';
import * as windowActions from '../../store/windows/windows.action';
import * as collectionActions from '../../store/collection/collection.action';
import * as authorizationActions from '../../store/authorization/authorization.action';
import * as preRequestActions from '../../store/pre-request/pre-request.action';
import * as postRequestActions from '../../store/post-request/post-request.action';
import * as localActions from '../../store/local/local.action';
import * as windowsMetaActions from '../../store/windows-meta/windows-meta.action';
import isElectron from 'altair-graphql-core/build/utils/is_electron';

import {
  GqlService,
  NotifyService,
  RequestHandlerRegistryService,
  WindowService,
} from '../../services';
import { Observable, EMPTY, combineLatest, of, BehaviorSubject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fadeInOutAnimationTrigger } from '../../animations';
import { IDictionary, TrackByIdItem } from '../../interfaces/shared';
import collectVariables from 'codemirror-graphql/utils/collectVariables';
import {
  HttpVerb,
  LogLine,
  QueryEditorState,
  QueryResponse,
  QueryState,
  RequestHandlerInfo,
  SelectedOperation,
} from 'altair-graphql-core/build/types/state/query.interfaces';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import { VariableState } from 'altair-graphql-core/build/types/state/variable.interfaces';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';
import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import { LayoutState } from 'altair-graphql-core/build/types/state/layout.interfaces';
import { History } from 'altair-graphql-core/build/types/state/history.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { DocView } from 'altair-graphql-core/build/types/state/docs.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { AltairUiAction } from 'altair-graphql-core/build/plugin/ui-action';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { str } from '../../utils';
import {
  AuthorizationState,
  AuthorizationTypes,
} from 'altair-graphql-core/build/types/state/authorization.interface';
import {
  RequestHandlerIds,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/types';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  animations: [fadeInOutAnimationTrigger],
  standalone: false,
})
export class WindowComponent implements OnInit {
  query$: Observable<QueryState>;
  showDocs$: Observable<boolean>;
  docView$: Observable<any>;
  docsIsLoading$: Observable<boolean>;
  headers$: Observable<HeaderState>;
  variables$: Observable<VariableState>;
  introspection$: Observable<any>;
  allowIntrospection$: Observable<boolean>;
  schemaLastUpdatedAt$: Observable<number | undefined>;
  responseStatus$: Observable<number>;
  responseTime$: Observable<number>;
  responseStatusText$: Observable<string>;
  responseHeaders$: Observable<IDictionary | undefined>;
  isSubscribed$: Observable<boolean>;
  queryResponses$: Observable<QueryResponse[]>;
  requestScriptLogs$: Observable<LogLine[]>;
  selectedOperation$?: Observable<SelectedOperation>;
  queryOperations$: Observable<OperationDefinitionNode[]>;
  streamState$: Observable<'connected' | 'failed' | 'uncertain' | ''>;
  currentCollection$: Observable<IQueryCollection | undefined>;
  preRequest$: Observable<PrerequestState>;
  postRequest$: Observable<PostrequestState>;
  layout$: Observable<LayoutState>;
  activeWindowId$: Observable<string>;
  authorizationState$: Observable<AuthorizationState>;

  addQueryDepthLimit$: Observable<number>;
  tabSize$: Observable<number>;
  disableLineNumbers$: Observable<boolean | undefined>;
  hideDeprecatedDocItems$: Observable<boolean | undefined>;
  enableExperimental$: Observable<boolean | undefined>;
  betaDisableNewEditor$: Observable<boolean | undefined>;
  autoscrollResponseList$: Observable<boolean>;
  settings$: Observable<SettingsState>;

  collections$: Observable<IQueryCollection[]>;

  resultPaneUiActions$: Observable<AltairUiAction[]>;
  resultPaneBottomPanels$: Observable<AltairPanel[]>;

  editorShortcutMapping$: Observable<IDictionary>;
  variableToType$: Observable<IDictionary>;

  hasUnsavedChanges$: Observable<boolean>;

  showRequestExtensionsDialog$: Observable<boolean>;

  windowState$: Observable<PerWindowState>;

  // Using getter/setter for the windowId to update the windowId$ subject.
  // We need the windowId$ subject to update the getWindowState observable
  // whenever the windowId changes, in order to get the right window state.
  private _windowId = '';
  @Input() set windowId(val: string) {
    this._windowId = val;
    this.windowId$.next(val);
  }
  get windowId() {
    return this._windowId;
  }
  windowId$ = new BehaviorSubject(this._windowId);

  isElectron = isElectron;
  apiUrl = '';
  query = '';

  showHeaderDialog = false;
  showVariableDialog = false;
  showRequestHandlerDialog = false;
  showHistoryDialog = false;
  showPreRequestDialog = true;

  gqlSchema: GraphQLSchema | undefined;

  subscriptionUrl = '';
  subscriptionConnectionParams = '';
  availableRequestHandlers$ = this.requestHandlerRegistry.getAllHandlerData$();
  selectedSubscriptionRequestHandlerId: RequestHandlerIds = WEBSOCKET_HANDLER_ID;

  historyList: History[] = [];

  constructor(
    private gql: GqlService,
    private notifyService: NotifyService,
    private store: Store<RootState>,
    private windowService: WindowService,
    private requestHandlerRegistry: RequestHandlerRegistryService
  ) {
    this.addQueryDepthLimit$ = this.store.pipe(
      select((state) => state.settings.addQueryDepthLimit)
    );
    this.tabSize$ = this.store.pipe(select((state) => state.settings.tabSize));
    this.enableExperimental$ = this.store.pipe(
      select((state) => state.settings.enableExperimental)
    );
    this.betaDisableNewEditor$ = this.store.pipe(
      select((state) => state.settings['beta.disable.newEditor'])
    );
    this.disableLineNumbers$ = this.store.pipe(
      select((state) => state.settings.disableLineNumbers)
    );
    this.hideDeprecatedDocItems$ = this.store.pipe(
      select((state) => state.settings['doc.hideDeprecatedItems'])
    );
    this.collections$ = this.store.pipe(select((state) => state.collection.list));
    this.activeWindowId$ = this.store.pipe(
      select((state) => state.windowsMeta.activeWindowId)
    );

    this.windowState$ = this.windowId$.pipe(
      distinctUntilChanged(),
      switchMap((windowId) =>
        this.store.pipe(
          select(fromRoot.selectWindowState(windowId)),
          distinctUntilChanged(),
          map((state) => state ?? fromRoot.getInitialPerWindowState())
        )
      ),
      shareReplay(1)
    );

    this.query$ = this.windowState$.pipe(select(fromRoot.getQueryState));
    this.queryResponses$ = this.windowState$.pipe(
      select(fromRoot.getQueryResponses),
      distinctUntilChanged()
    );
    this.showDocs$ = this.windowState$.pipe(select(fromRoot.selectShowDocs));
    this.docView$ = this.windowState$.pipe(select(fromRoot.selectDocView));
    this.docsIsLoading$ = this.windowState$.pipe(select(fromRoot.selectDocsLoading));
    this.headers$ = this.windowState$.pipe(select(fromRoot.getHeaders));
    this.variables$ = this.windowState$.pipe(select(fromRoot.getVariables));
    this.introspection$ = this.windowState$.pipe(select(fromRoot.getIntrospection));
    this.allowIntrospection$ = this.windowState$.pipe(
      select(fromRoot.allowIntrospection)
    );
    this.schemaLastUpdatedAt$ = this.windowState$.pipe(
      select(fromRoot.getSchemaLastUpdatedAt)
    );
    this.responseStatus$ = this.windowState$.pipe(
      select(fromRoot.getResponseStatus)
    );
    this.responseTime$ = this.windowState$.pipe(select(fromRoot.getResponseTime));
    this.responseStatusText$ = this.windowState$.pipe(
      select(fromRoot.getResponseStatusText)
    );
    this.responseHeaders$ = this.windowState$.pipe(
      select(fromRoot.getResponseHeaders)
    );
    this.isSubscribed$ = this.windowState$.pipe(select(fromRoot.isSubscribed));
    this.requestScriptLogs$ = this.windowState$.pipe(
      select(fromRoot.getRequestScriptLogs)
    );
    this.autoscrollResponseList$ = this.windowState$.pipe(
      select(fromRoot.getAutoscrollResponseList)
    );
    this.settings$ = this.store.select('settings');

    this.selectedOperation$ = this.windowState$.pipe(
      select(fromRoot.getSelectedOperation)
    );
    this.queryOperations$ = this.windowState$.pipe(
      select(fromRoot.getQueryOperations)
    );
    this.streamState$ = this.windowState$.pipe(
      select(fromRoot.getStreamStateString)
    );
    this.currentCollection$ = this.windowState$.pipe(
      switchMap((data) => {
        if (data?.layout?.collectionId) {
          return this.collections$.pipe(
            map((collections) => {
              return collections.find(
                (collection) => str(collection.id) === str(data.layout.collectionId)
              );
            })
          );
        }

        return EMPTY;
      })
    );
    this.preRequest$ = this.windowState$.pipe(select(fromRoot.getPreRequest));
    this.postRequest$ = this.windowState$.pipe(select(fromRoot.getPostRequest));
    this.layout$ = this.windowState$.pipe(select(fromRoot.getLayout));

    this.resultPaneUiActions$ = this.store.select(fromRoot.getResultPaneUiActions);
    this.resultPaneBottomPanels$ = this.store.select(
      fromRoot.getResultPaneBottomPanels
    );

    this.editorShortcutMapping$ = this.store.select(
      (state) => state.settings['editor.shortcuts'] ?? {}
    );

    this.authorizationState$ = this.windowState$.pipe(
      select(fromRoot.getAuthorizationState)
    );

    this.variableToType$ = combineLatest([
      this.query$.pipe(select((q) => q.query ?? '')),
      this.windowState$.pipe(select(fromRoot.getSchema)),
    ]).pipe(
      map(([query, schema]) => {
        return collectVariables(schema, this.gql.parseQuery(query));
      }),
      catchError(() => EMPTY)
    );

    this.hasUnsavedChanges$ = this.store.pipe(
      withLatestFrom(this.windowId$),
      switchMap(([state, windowId]) => {
        return select(fromRoot.selectHasUnsavedChanges(windowId))(of(state));
      })
    );

    this.showRequestExtensionsDialog$ = this.windowState$.pipe(
      select(fromRoot.getShowRequestExtensionsDialog)
    );
  }

  ngOnInit() {
    this.store
      .pipe(
        untilDestroyed(this),
        map((data) => data.windows[this.windowId]),
        distinctUntilChanged()
      )
      .subscribe((data) => {
        if (!data) {
          return false;
        }

        this.apiUrl = data.query.url;
        const query = data.query.query ?? '';
        this.query = query;
        this.showHeaderDialog = data.dialogs.showHeaderDialog;
        this.showVariableDialog = data.dialogs.showVariableDialog;
        this.showRequestHandlerDialog = data.dialogs.showRequestHandlerDialog;
        this.showHistoryDialog = data.dialogs.showHistoryDialog;
        this.showPreRequestDialog = data.dialogs.showPreRequestDialog;

        this.subscriptionUrl = data.query.subscriptionUrl;
        this.subscriptionConnectionParams =
          data.query.subscriptionConnectionParams || '';
        this.selectedSubscriptionRequestHandlerId =
          data.query.subscriptionRequestHandlerId ?? WEBSOCKET_HANDLER_ID;
        this.historyList = data.history.list;

        // Schema needs to be valid instances of GQLSchema.
        // Rehydrated schema objects are not valid, so we get the schema again.
        if (this.gql.isSchema(data.schema.schema)) {
          this.gqlSchema = data.schema.schema;
        } else {
          const schema = this.gql.getIntrospectionSchema(data.schema.introspection);
          if (schema) {
            this.store.dispatch(
              new schemaActions.SetSchemaAction(this.windowId, schema)
            );
          }
        }
      });

    // Reload the schema when the environment changes
    this.store
      .select(
        createSelector(
          fromRoot.getActiveSubEnvironmentState,
          (state) => state.settings['schema.reload.onEnvChange'],
          (activeEnvironment, reloadOnChange) => {
            if (reloadOnChange) {
              return activeEnvironment;
            }

            return null;
          }
        )
      )
      .pipe(untilDestroyed(this))
      .subscribe((dt) => {
        if (dt !== null) {
          this.reloadDocs();
        }
      });

    this.windowService.setupWindow(this.windowId);
  }

  setApiUrl(url: string) {
    if (url !== this.apiUrl) {
      this.store.dispatch(new queryActions.SetUrlAction({ url }, this.windowId));
      this.store.dispatch(
        new queryActions.SendIntrospectionQueryRequestAction(this.windowId)
      );
    }
  }

  setApiMethod(httpVerb: HttpVerb) {
    this.store.dispatch(
      new queryActions.SetHTTPMethodAction({ httpVerb }, this.windowId)
    );
  }

  sendRequest(opts: { operationName?: string } = {}) {
    if (opts.operationName) {
      this.store.dispatch(
        new queryActions.SetSelectedOperationAction(this.windowId, {
          selectedOperation: opts.operationName,
        })
      );
    }
    this.store.dispatch(new queryActions.SendQueryRequestAction(this.windowId));
  }

  cancelRequest() {
    this.store.dispatch(new queryActions.CancelQueryRequestAction(this.windowId));
  }

  selectOperation(selectedOperation: string) {
    this.store.dispatch(
      new queryActions.SetSelectedOperationAction(this.windowId, {
        selectedOperation,
      })
    );
    this.sendRequest();
  }

  setQueryEditorState(queryEditorState: QueryEditorState) {
    this.store.dispatch(
      new queryActions.SetQueryEditorStateAction(this.windowId, queryEditorState)
    );
  }

  toggleAutoscrollSubscriptionResponses() {
    this.store.dispatch(
      new queryActions.ToggleAutoscrollResponseListAction(this.windowId)
    );
  }

  updateQuery(query: string) {
    this.store.dispatch(new queryActions.SetQueryAction(query, this.windowId));
  }

  toggleHeader(isOpen: boolean | undefined = undefined) {
    if (this.showHeaderDialog !== isOpen) {
      this.store.dispatch(
        new dialogsActions.ToggleHeaderDialogAction(this.windowId)
      );
    }
  }

  toggleVariableDialog(isOpen = undefined) {
    if (this.showVariableDialog !== isOpen) {
      this.store.dispatch(
        new dialogsActions.ToggleVariableDialogAction(this.windowId)
      );
    }
  }

  toggleRequestHandlerDialog(isOpen: boolean) {
    this.store.dispatch(
      new dialogsActions.ToggleRequestHandlerDialogAction(this.windowId, {
        value: isOpen,
      })
    );
  }

  toggleHistoryDialog(isOpen: boolean) {
    if (this.showHistoryDialog !== isOpen) {
      this.store.dispatch(
        new dialogsActions.ToggleHistoryDialogAction(this.windowId)
      );
    }
  }

  setShowAddToCollectionDialog(value: boolean) {
    this.store.dispatch(
      new windowsMetaActions.ShowAddToCollectionDialogAction({
        value,
        windowId: this.windowId,
      })
    );
  }

  togglePreRequestDialog(isOpen: boolean) {
    if (this.showPreRequestDialog !== isOpen) {
      this.store.dispatch(
        new dialogsActions.TogglePreRequestDialogAction(this.windowId)
      );
    }
  }

  toggleRequestExtensionsDialog(isOpen: boolean) {
    this.store.dispatch(
      new dialogsActions.ToggleRequestExtensionsDialogAction(this.windowId, {
        value: isOpen,
      })
    );
  }

  updateRequestExtensions(requestExtensions: string) {
    this.store.dispatch(
      new queryActions.SetRequestExtensionsDataAction(this.windowId, {
        data: requestExtensions,
      })
    );
  }

  togglePanelActive(panel: AltairPanel) {
    this.store.dispatch(
      new localActions.SetPanelActiveAction({
        panelId: panel.id,
        isActive: !panel.isActive,
      })
    );
  }

  setDocView(docView: DocView) {
    this.store.dispatch(
      new docsActions.SetDocViewAction(this.windowId, { docView })
    );
  }
  onShowTokenInDocs(docView: DocView) {
    this.setDocView(docView);
    this.showDocs$.pipe(take(1), untilDestroyed(this)).subscribe({
      next: (docsShown) => {
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
    this.store.dispatch(
      new queryActions.SendIntrospectionQueryRequestAction(this.windowId)
    );
  }

  addHeader() {
    this.store.dispatch(new headerActions.AddHeaderAction(this.windowId));
  }

  headerKeyChange(val: string, i: number) {
    this.store.dispatch(
      new headerActions.EditHeaderKeyAction({ val, i }, this.windowId)
    );
  }
  headerValueChange(val: string, i: number) {
    this.store.dispatch(
      new headerActions.EditHeaderValueAction({ val, i }, this.windowId)
    );
  }

  headerEnabledChange(val: boolean, i: number) {
    this.store.dispatch(
      new headerActions.EditHeaderEnabledAction({ val, i }, this.windowId)
    );
  }

  removeHeader(i: number) {
    this.store.dispatch(new headerActions.RemoveHeaderAction(i, this.windowId));
  }

  updateVariables(variables: string) {
    this.store.dispatch(
      new variableActions.UpdateVariablesAction(variables, this.windowId)
    );
  }

  addFileVariable(fileVariable?: {
    name: string;
    data: File[];
    isMultiple: boolean;
  }) {
    this.store.dispatch(
      new variableActions.AddFileVariableAction(this.windowId, fileVariable)
    );
  }
  updateFileVariableName({ index, name }: { index: number; name: string }) {
    this.store.dispatch(
      new variableActions.UpdateFileVariableNameAction(this.windowId, {
        index,
        name,
      })
    );
  }

  updateFileVariableIsMultiple({
    index,
    isMultiple,
  }: {
    index: number;
    isMultiple: boolean;
  }) {
    this.store.dispatch(
      new variableActions.UpdateFileVariableIsMultipleAction(this.windowId, {
        index,
        isMultiple,
      })
    );
  }

  updateFileVariableData({
    index,
    fileData,
    fromCache,
  }: {
    index: number;
    fileData: File[];
    fromCache?: boolean;
  }) {
    this.store.dispatch(
      new variableActions.UpdateFileVariableDataAction(this.windowId, {
        index,
        fileData,
        fromCache,
      })
    );
  }

  deleteFileVariable({ index }: { index: number }) {
    this.store.dispatch(
      new variableActions.DeleteFileVariableAction(this.windowId, { index })
    );
  }

  upateRequestHandlerInfo(info: RequestHandlerInfo) {
    this.store.dispatch(
      new queryActions.SetRequestHandlerInfoAction(this.windowId, info)
    );
  }

  updatePreRequestScript(script: string) {
    this.store.dispatch(
      new preRequestActions.SetPreRequestScriptAction(this.windowId, { script })
    );
  }

  updatePreRequestEnabled(enabled: boolean) {
    this.store.dispatch(
      new preRequestActions.SetPreRequestEnabledAction(this.windowId, {
        enabled,
      })
    );
  }

  updatePostRequestScript(script: string) {
    this.store.dispatch(
      new postRequestActions.SetPostRequestScriptAction(this.windowId, {
        script,
      })
    );
  }

  updatePostRequestEnabled(enabled: boolean) {
    this.store.dispatch(
      new postRequestActions.SetPostRequestEnabledAction(this.windowId, {
        enabled,
      })
    );
  }

  updateAuthType(type: AuthorizationTypes) {
    this.store.dispatch(
      new authorizationActions.SelectAuthorizationTypeAction(this.windowId, {
        type,
      })
    );
  }

  updateAuthData(data: unknown) {
    this.store.dispatch(
      new authorizationActions.UpdateAuthorizationDataAction(this.windowId, {
        data,
      })
    );
  }

  addQueryToEditor(queryData: { query: string; meta: { hasArgs: boolean } }) {
    // Add the query to what is already in the editor
    this.store.dispatch(
      new queryActions.SetQueryAction(
        `${this.query}\n${queryData.query}`,
        this.windowId
      )
    );

    // If the query has args
    if (queryData.meta.hasArgs) {
      this.notifyService.warning('Fill in the arguments for the query!');
    }
  }

  clearResult() {
    this.store.dispatch(new queryActions.ClearResultAction(this.windowId));
    this.store.dispatch(
      new queryActions.SetQueryResponsesAction(this.windowId, { responses: [] })
    );
  }

  downloadResult(content: string) {
    this.store.dispatch(
      new queryActions.DownloadResultAction(this.windowId, { content })
    );
  }

  // Set the value of the item in the specified index of the history list
  restoreHistory(index: number) {
    if (this.historyList[index]) {
      this.store.dispatch(
        new queryActions.SetQueryAction(
          this.historyList[index]?.query ?? '',
          this.windowId
        )
      );
    }
  }

  clearHistory() {
    this.store.dispatch(new historyActions.ClearHistoryAction(this.windowId));
  }

  updateQueryInCollection() {
    this.store.dispatch(
      new collectionActions.UpdateQueryInCollectionAction({
        windowId: this.windowId,
      })
    );
  }

  onCloseAddToCollectionDialog() {
    this.setShowAddToCollectionDialog(false);
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
    this.store.dispatch(
      new windowActions.ExportWindowAction({ windowId: this.windowId })
    );
  }

  trackByIndex(index: number, s: unknown) {
    return index;
  }

  trackById(index: number, item: TrackByIdItem) {
    return item.id;
  }
}
