
import {of as observableOf, empty as observableEmpty, timer as observableTimer,  Observable } from 'rxjs';

import {debounce, tap, catchError, withLatestFrom, switchMap, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';

import * as validUrl from 'valid-url';

import { GqlService, QueryService, NotifyService, DbService, DonationService, ElectronAppService, EnvironmentService } from '../services';
import * as fromRoot from '../reducers';

import { Action as allActions } from '../actions';
import * as queryActions from '../actions/query/query';
import * as layoutActions from '../actions/layout/layout';
import * as gqlSchemaActions from '../actions/gql-schema/gql-schema';
import * as dbActions from '../actions/db/db';
import * as docsAction from '../actions/docs/docs';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';
import * as donationAction from '../actions/donation';
import * as historyActions from '../actions/history/history';
import * as dialogsActions from '../actions/dialogs/dialogs';
import * as streamActions from '../actions/stream/stream';

import { downloadJson, downloadData, copyToClipboard, openFile } from '../utils';
import { uaSeedHash } from '../utils/simple_hash';
import config from '../config';
import { debug } from '../utils/logger';
import { generateCurl } from 'app/utils/curl';

@Injectable()
export class QueryEffects {

    @Effect()
    // Sends the query request to the specified URL
    // with the specified headers and variables
    sendQueryRequest$: Observable<Action> = this.actions$
        .ofType(queryActions.SEND_QUERY_REQUEST, queryActions.CANCEL_QUERY_REQUEST)
        .pipe(
          withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
              return { data: state.windows[action.windowId], windowId: action.windowId, action };
          }),
          switchMap(response => {
            const query = response.data.query.query.trim();
            const url = this.environmentService.hydrate(response.data.query.url);
            const variables = this.environmentService.hydrate(response.data.variables.variables);
            const headers = this.environmentService.hydrateHeaders(response.data.headers);
            let selectedOperation = response.data.query.selectedOperation;

            // If the query is empty, just return
            if (!query) {
              return observableEmpty();
            }

            // If the URL is not set or is invalid, just return
            if (!url || !validUrl.isUri(url)) {

                this.notifyService.error('The URL is invalid!');
                this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                return observableEmpty();
            }

            if (response.action.type === queryActions.CANCEL_QUERY_REQUEST) {
                this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                return observableEmpty();
            }

            // Store the current query into the history if it does not already exist in the history
            if (!response.data.history.list.filter(item => item.query && item.query.trim() === query.trim()).length) {
              this.store.dispatch(new historyActions.AddHistoryAction(response.windowId, { query }));
            }

            // If the query is a subscription, subscribe to the subscription URL and send the query
            if (this.gqlService.isSubscriptionQuery(query)) {
              debug.log('Your query is a SUBSCRIPTION!!!');
              // If the subscription URL is not set, show the dialog for the user to set it
              if (!response.data.query.subscriptionUrl) {
                this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(response.windowId));
              } else {
                this.store.dispatch(new queryActions.StartSubscriptionAction(response.windowId));
              }
              return observableEmpty();
            }

            try {
              const operationData = this.gqlService.getSelectedOperationData({
                query,
                selectedOperation,
                queryCursorIndex: response.data.query.queryEditorState &&
                  response.data.query.queryEditorState.isFocused &&
                  response.data.query.queryEditorState.cursorIndex,
              });

              this.store.dispatch(new queryActions.SetQueryOperationsAction(response.windowId, { operations: operationData.operations }));
              selectedOperation = operationData.selectedOperation;
            } catch (err) {
              this.store.dispatch(new queryActions.SetSelectedOperationAction(response.windowId, { selectedOperation: '' }));
              this.notifyService.warning(err.message);
              return observableEmpty();
            }

            this.store.dispatch(new layoutActions.StartLoadingAction(response.windowId));

            const requestStartTime = new Date().getTime();
            let requestStatusCode = 0;
            let requestStatusText = '';

            try {
              if (variables) {
                JSON.parse(variables);
              }
            } catch (err) {
              this.notifyService.error('Looks like your variables is not a valid JSON string.');
              this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
              return observableEmpty();
            }

            // For electron app, send the instruction to set headers
            this.electronAppService.setHeaders(headers);

            debug.log('Sending..');
            return this.gqlService
              .sendRequest(url, {
                query,
                variables,
                headers,
                method: response.data.query.httpVerb,
                selectedOperation,
                files: response.data.variables.files,
              })
              .pipe(
                map(res => {
                  requestStatusCode = res.status;
                  requestStatusText = res.statusText;
                  return res.body;
                }),
                map(result => {
                  return new queryActions.SetQueryResultAction(result, response.windowId);
                }),
                catchError((error) => {
                  let output = 'Server Error';

                  debug.log(error);
                  requestStatusCode = error.status;
                  requestStatusText = error.statusText;

                  if (error.status) {
                    output = error.error;
                  }
                  return observableOf(new queryActions.SetQueryResultAction(output, response.windowId));
                }),
                tap(() => {
                  const requestEndTime = new Date().getTime();
                  const requestElapsedTime = requestEndTime - requestStartTime;

                  this.store.dispatch(new queryActions.SetResponseStatsAction(response.windowId, {
                    responseStatus: requestStatusCode,
                    responseTime: requestElapsedTime,
                    responseStatusText: requestStatusText
                  }));
                  this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                }),
              );
          }),
        );

    @Effect()
    // Shows the URL set alert after the URL is set
    showUrlSetAlert$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.SET_URL)
      .pipe(
        switchMap((data: queryActions.Action) => {
          const url = this.environmentService.hydrate(data.payload.url);
          // If the URL is not valid
          if (!validUrl.isUri(url)) {
              this.notifyService.error('The URL is invalid!');
          } else {
            this.notifyService.success('URL has been set.');
          }

          return observableEmpty();
        }),
      );

    @Effect()
    // Gets the gql schema after the introspection is set
    getGqlSchema$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_INTROSPECTION, gqlSchemaActions.SET_INTROSPECTION_FROM_DB).pipe(
        switchMap((data: queryActions.Action) => {
            const schema = this.gqlService.getIntrospectionSchema(data.payload);

            if (schema) {
              return observableOf(new gqlSchemaActions.SetSchemaAction(data.windowId, schema));
            }

            return observableEmpty();
        }));

    // Sets the schema SDL after setting the schema
    @Effect()
    setSchemaSDL$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_SCHEMA)
        .pipe(
          switchMap((action: gqlSchemaActions.SetSchemaAction) => {
            const schema = action.payload;
            if (schema) {
              return observableOf(
                new gqlSchemaActions.SetSchemaSDLAction(action.windowId, { sdl: this.gqlService.getSDL(schema) })
              );
            }

            return observableEmpty();
          })
        );

    @Effect()
    loadSDLSchema$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.LOAD_SDL_SCHEMA)
        .pipe(
          switchMap((data: gqlSchemaActions.LoadSDLSchemaAction) => {
            openFile({ accept: '.gql' }).then((sdlData: string) => {
              try {
                const schema = this.gqlService.sdlToSchema(sdlData);
                if (schema) {
                  this.notifyService.success('Loaded schema successfully');
                  return this.store.dispatch(new gqlSchemaActions.SetSchemaAction(data.windowId, schema));
                }
              } catch (err) {
                this.notifyService.error('There was a problem loading the schema');
                debug.error('Error while loading schema', err);
              }
            })
            return observableEmpty();
          })
        )

    @Effect()
    saveUrlToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL).pipe(
        map((data: queryActions.Action) => {
            this.queryService.storeUrl(data.payload.url, data.windowId);
            return new dbActions.SaveUrlSuccessAction();
        }));

    @Effect()
    saveQueryToDb$: Observable<Action> = this.actions$
      .ofType(queryActions.SET_QUERY)
      .pipe(
        // Save query after user has stopped typing for 500ms
        debounce(() => observableTimer(500)),
        map((data: queryActions.Action) => {
            this.queryService.storeQuery(data.payload, data.windowId);
            return new dbActions.SaveQuerySuccessAction();
        }),
      );

    @Effect()
    saveIntrospectionToDb$: Observable<Action> = this.actions$
      .ofType(gqlSchemaActions.SET_INTROSPECTION).pipe(
      map((data: queryActions.Action) => {
        this.queryService.storeIntrospection(data.payload, data.windowId);
        return new dbActions.SaveIntrospectionSuccessAction();
      }));

    @Effect()
    getIntrospectionForUrl$: Observable<Action> = this.actions$
      .ofType(queryActions.SEND_INTROSPECTION_QUERY_REQUEST)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap((res) => {
          const url = this.environmentService.hydrate(res.data.query.url);
          const headers = this.environmentService.hydrateHeaders(res.data.headers);

          if (!url) {
            return observableEmpty();
          }

          this.store.dispatch(new docsAction.StartLoadingDocsAction(res.windowId));
          return this.gqlService
            .getIntrospectionRequest(url, {
              method: res.data.query.httpVerb,
              headers
            })
            .pipe(
              catchError(err => {
                this.store.dispatch(new docsAction.StopLoadingDocsAction(res.windowId));
                const errorObj = err.error || err;
                let allowsIntrospection = true;

                if (errorObj.errors) {
                  errorObj.errors.forEach(error => {
                    if (error.code === 'GRAPHQL_VALIDATION_ERROR') {
                      allowsIntrospection = false;
                    }
                  });
                }

                // If the server does not support introspection
                if (!allowsIntrospection) {
                  this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(false, res.windowId));
                } else {
                  this.notifyService.warning(`
                    Seems like something is broken. Please check that the URL is valid,
                    and the server is up and running properly.
                  `);
                }
                return observableEmpty();
              }),
              map(introspectionResponse => {
                this.store.dispatch(new docsAction.StopLoadingDocsAction(res.windowId));
                const introspectionData = introspectionResponse.body && introspectionResponse.body.data;
                const streamUrl = introspectionResponse.headers
                  && introspectionResponse.headers.get('X-GraphQL-Event-Stream'); // || '/graphql/stream'; // For development.
                this.store.dispatch(new streamActions.SetStreamSettingAction(res.windowId, { streamUrl }));
                if (streamUrl) {
                  this.store.dispatch(new streamActions.StartStreamClientAction(res.windowId));
                }
                if (!introspectionData) {
                  return new gqlSchemaActions.SetIntrospectionAction(introspectionData, res.windowId);
                }

                this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(true, res.windowId));

                return new gqlSchemaActions.SetIntrospectionAction(introspectionData, res.windowId);
              }),
            );
        }),
      );

    @Effect()
    // Hides the editor set alert after it has been shown
    showEditorSetAlert$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.SHOW_EDITOR_ALERT).pipe(
      switchMap((data: queryActions.Action) => {
        return observableTimer(3000).pipe(
          switchMap(() => observableOf(new queryActions.HideEditorAlertAction(data.windowId))));
      }));

    @Effect()
    notifyExperimental$: Observable<Action> = this.actions$
      .ofType(layoutActions.NOTIFY_EXPERIMENTAL).pipe(
      switchMap(() => {
        this.dbService.getItem('exp_add_query_seen').subscribe(val => {
          if (!val) {
            this.notifyService.info(`
              This feature is experimental, and still in beta.
              Click here to submit bugs, improvements, etc.
            `, null, {
              tapToDismiss: true,
              data: {
                url: 'https://github.com/imolorhe/altair/issues/new'
              }
            });
            this.dbService.setItem('exp_add_query_seen', true);
          }
        });
        return observableEmpty();
      }));

    @Effect()
    downloadResult$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.DOWNLOAD_RESULT)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          downloadJson(res.data.query.response, res.data.layout.title);

          return observableEmpty();
        }),
      );

    @Effect()
    startSubscription$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.START_SUBSCRIPTION)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          let connectionParams = undefined;
          const subscriptionUrl = this.environmentService.hydrate(res.data.query.subscriptionUrl);
          const query = this.environmentService.hydrate(res.data.query.query);
          const variables = this.environmentService.hydrate(res.data.variables.variables);
          let selectedOperation = res.data.query.selectedOperation;

          try {
            const operationData = this.gqlService.getSelectedOperationData({
              query,
              selectedOperation,
              queryCursorIndex: res.data.query.queryEditorState &&
                res.data.query.queryEditorState.isFocused &&
                res.data.query.queryEditorState.cursorIndex,
              selectIfOneOperation: true,
            });

            this.store.dispatch(new queryActions.SetQueryOperationsAction(res.windowId, { operations: operationData.operations }));
            selectedOperation = operationData.selectedOperation;
          } catch (err) {
            this.store.dispatch(new queryActions.SetSelectedOperationAction(res.windowId, { selectedOperation: '' }));
            this.notifyService.warning(err.message);
            return observableEmpty();
          }

          const subscriptionErrorHandler = (err, errMsg?) => {
            if (Array.isArray(err)) {
              err = err[0];
            }
            errMsg = errMsg || err.message || err.stack;
            this.notifyService.error(`
              An error occurred in subscription.<br>
              Error: ${errMsg}
            `);
            this.store.dispatch(new queryActions.StopSubscriptionAction(res.windowId));
            return observableEmpty();
          };
          try {
            // Stop any currently active subscription
            this.gqlService.closeSubscriptionClient(res.data.query.subscriptionClient);


            try {
              const subscriptionConnectionParams = this.environmentService.hydrate(res.data.query.subscriptionConnectionParams);

              connectionParams =
                subscriptionConnectionParams ? JSON.parse(subscriptionConnectionParams) : undefined;
            } catch (err) {
              this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(res.windowId));
              return subscriptionErrorHandler(err, 'Your connection parameters is not a valid JSON object.');
            }

            const subscriptionClient = this.gqlService.createSubscriptionClient(subscriptionUrl, {
              connectionParams,
              connectionCallback: error => {
                if (error) {
                  debug.log('Subscription connection error', error);
                  return subscriptionErrorHandler(error);
                }
                debug.log('Connected subscription.');
              }
            });
            const subscriptionClientRequest = subscriptionClient.request({
              query: query,
              variables: JSON.parse(variables),
              operationName: selectedOperation || undefined,
            }).subscribe({
              next: data => {
                let strData = '';
                try {
                  strData = JSON.stringify(data);
                } catch (err) {
                  debug.error('Invalid subscription response format.');
                  strData = 'ERROR: Invalid subscription response format.';
                }

                this.store.dispatch(new queryActions.AddSubscriptionResponseAction(res.windowId, {
                  response: strData,
                  responseTime: (new Date()).getTime() // store responseTime in ms
                }));

                // Send notification in electron app
                this.notifyService.pushNotify(strData, res.data.layout.title, {
                  onclick: () => {
                    this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId: res.windowId }));
                  }
                });

                debug.log(data);
              },
              error: err => {
                // Stop the subscription if this happens.
                debug.log('Err', err);
                return subscriptionErrorHandler(err);
              },
              complete: () => {
                // Not yet sure what needs to be done here.
                debug.log('Subscription complete.');
              }
            });

            return observableOf(new queryActions.SetSubscriptionClientAction(res.windowId, { subscriptionClient }));
          } catch (err) {
            debug.error('An error occurred starting the subscription.', err);
            return subscriptionErrorHandler(err);
          }
        }),
      );

    @Effect()
    stopSubscription$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.STOP_SUBSCRIPTION)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          this.gqlService.closeSubscriptionClient(res.data.query.subscriptionClient);
          return observableOf(new queryActions.SetSubscriptionClientAction(res.windowId, { subscriptionClient: null }));
        }),
      );

    @Effect()
    prettifyQuery$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.PRETTIFY_QUERY)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action, settings: state.settings };
        }),
        switchMap(res => {
          let prettified = '';
          try {
            prettified = this.gqlService.prettify(res.data.query.query, res.settings.tabSize);
          } catch (err) {
            debug.log(err);
            this.notifyService.error('Your query does not appear to be valid. Please check it.');
          }

          if (prettified) {
            return observableOf(new queryActions.SetQueryAction(prettified, res.windowId));
          }
          return observableEmpty();
        }),
      );

    @Effect()
    compressQuery$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.COMPRESS_QUERY)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          let compressed = '';
          try {
            debug.log('We compress..');
            compressed = this.gqlService.compress(res.data.query.query);
            debug.log('Compressed..');
          } catch (err) {
            debug.log(err);
            this.notifyService.error('Your query does not appear to be valid. Please check it.');
          }

          if (compressed) {
            return observableOf(new queryActions.SetQueryAction(compressed, res.windowId));
          }
          return observableEmpty();
        }),
      );

    @Effect()
    exportSDL$: Observable<Action> = this.actions$
      .ofType(gqlSchemaActions.EXPORT_SDL)
      .pipe(
        withLatestFrom(this.store, (action: gqlSchemaActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {

          if (res.data.schema.schema) {
            const sdl = this.gqlService.getSDL(res.data.schema.schema);

            if (sdl) {
              downloadData(sdl, 'sdl', { fileType: 'gql' });
            }
          }
          return observableEmpty();
        }),
      );

    @Effect()
    copyAsCurl$: Observable<Action> = this.actions$
      .ofType(queryActions.COPY_AS_CURL)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          const url = this.environmentService.hydrate(res.data.query.url);
          const query = this.environmentService.hydrate(res.data.query.query);
          const variables = this.environmentService.hydrate(res.data.variables.variables);
          try {
            const curlCommand = generateCurl({
              url,
              method: res.data.query.httpVerb,
              headers: res.data.headers.reduce((acc, cur) => {
                acc[cur.key] = this.environmentService.hydrate(cur.value);
                return acc;
              }, {}),
              data: {
                query,
                variables: JSON.parse(variables)
              }
            });
            debug.log(curlCommand);
            copyToClipboard(curlCommand);
            this.notifyService.success('Copied cURL command to clipboard.');
          } catch (err) {
            debug.log('Error while copying as curl', err);
          }
          return observableEmpty();
        })
      )

    @Effect()
    convertToNamedQuery$: Observable<Action> = this.actions$
      .ofType(queryActions.CONVERT_TO_NAMED_QUERY)
      .pipe(
        withLatestFrom(this.store, (action: queryActions.Action, state) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          try {
            const namedQuery = this.gqlService.nameQuery(res.data.query.query);
            return observableOf(new queryActions.SetQueryAction(namedQuery, res.windowId));
          } catch (err) {
            debug.log(err);
            this.notifyService.error('Your query does not appear to be valid. Please check it.');
          }

          return observableEmpty();
        }),
      );

    @Effect()
    showDonationAlert$: Observable<Action> = this.actions$
      .ofType(queryActions.SEND_QUERY_REQUEST).pipe(
      switchMap((data: queryActions.Action) => {
        this.donationService.trackAndCheckIfEligible().subscribe(shouldShow => {
          if (shouldShow) {
            this.store.dispatch(new donationAction.ShowDonationAlertAction());
          }
        });
        return observableEmpty();
      }));

      @Effect()
      startStreamClient$: Observable<streamActions.Action> = this.actions$
        .ofType(streamActions.START_STREAM_CLIENT)
        .pipe(
          withLatestFrom(this.store, (action: streamActions.Action, state: fromRoot.State) => {
            return { data: state.windows[action.windowId], windowId: action.windowId, action };
          }),
          switchMap(res => {

            if (!res.data.stream.url) {
              return observableEmpty();
            }
            const endpoint = new URL(this.environmentService.hydrate(res.data.query.url));
            const streamUrl = new URL(
              this.environmentService.hydrate(res.data.stream.url),
              endpoint
            );

            if (endpoint.host !== streamUrl.host) {
              this.notifyService.error(`
                The stream and endpoint domains do not match. Please check your server implementation.
                [${endpoint.host} != ${streamUrl.host}]
              `);
              return observableEmpty();
            }
            try {
              // Stop any currently active stream client
              this.gqlService.closeStreamClient(res.data.stream.client);

              const streamClient = this.gqlService.createStreamClient(streamUrl);
              let backoff = res.action.payload.backoff || 200;

              streamClient.addEventListener('change', () => {
                this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(res.windowId));
              }, false);

              streamClient.addEventListener('open', () => {
                // Clear error state
                this.store.dispatch(new streamActions.SetStreamFailedAction(res.windowId, { failed: null }));
                this.store.dispatch(new streamActions.SetStreamConnectedAction(res.windowId, { connected: true }));
                // Reset backoff
                backoff = 200;
              }, false);

              streamClient.addEventListener('error', (err) => {
                this.store.dispatch(new streamActions.SetStreamFailedAction(res.windowId, { failed: err }));
                // Retry after sometime
                setTimeout(() => {
                  backoff = Math.min(backoff * 1.7, 30000);
                  this.store.dispatch(new streamActions.StartStreamClientAction(res.windowId, { backoff }));
                }, backoff);
              }, false);

              return observableOf(new streamActions.SetStreamClientAction(res.windowId, { streamClient }));
            } catch (err) {
              debug.error('An error occurred starting the stream.', err);
              // return subscriptionErrorHandler(err);
            }
          }),
        );

    @Effect()
    stopStreamClient$: Observable<streamActions.Action> = this.actions$
      .ofType(streamActions.STOP_STREAM_CLIENT)
      .pipe(
        withLatestFrom(this.store, (action: streamActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          this.gqlService.closeStreamClient(res.data.stream.client);
          return observableOf(new streamActions.SetStreamClientAction(res.windowId, { streamClient: null }));
        }),
      );

    // Get the introspection after setting the URL
    constructor(
      private actions$: Actions,
      private gqlService: GqlService,
      private queryService: QueryService,
      private notifyService: NotifyService,
      private dbService: DbService,
      private donationService: DonationService,
      private electronAppService: ElectronAppService,
      private environmentService: EnvironmentService,
      private store: Store<any>
    ) {}

  getVariablesObj(variables) {
    const vars = {};

    variables.forEach(v => {
      if (v.key && v.value) {
        vars[v.key] = JSON.parse(v.value);
      }
    });

    return vars;
  }
}
