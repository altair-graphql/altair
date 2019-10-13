
import {of as observableOf, empty as observableEmpty, timer as observableTimer,  Observable, iif } from 'rxjs';

import { debounce, tap, catchError, withLatestFrom, switchMap, map, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, ofType } from '@ngrx/effects';

import * as validUrl from 'valid-url';

import {
  GqlService,
  NotifyService,
  DbService,
  DonationService,
  ElectronAppService,
  EnvironmentService,
  PreRequestService
} from '../services';
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

interface EffectResponseData {
  data: fromRoot.PerWindowState;
  windowId: string;
  action: any;
}

@Injectable()
export class QueryEffects {

    @Effect()
    // Sends the query request to the specified URL
    // with the specified headers and variables
    sendQueryRequest$: Observable<Action> = this.actions$
      .pipe(
        ofType(queryActions.SEND_QUERY_REQUEST, queryActions.CANCEL_QUERY_REQUEST),
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
            return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(response => {

          if (response.action.type === queryActions.CANCEL_QUERY_REQUEST) {
              this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
              return observableEmpty();
          }

          const query = response.data.query.query.trim();
          if (!query) {
            return observableEmpty();
          }

          return observableOf(response);
        }),
        switchMap(response => {
          return this.getPrerequesstTransformedData$(response);
        }),
        switchMap((returnedData) => {
          if (!returnedData) {
            return observableEmpty();
          }

          return observableOf(returnedData)
            .pipe(
              switchMap((_returnedData) => {
                const { response, transformedData } = _returnedData;

                const query = response.data.query.query.trim();
                let url = this.environmentService.hydrate(response.data.query.url);
                let variables = this.environmentService.hydrate(response.data.variables.variables);
                let headers = this.environmentService.hydrateHeaders(response.data.headers);
                let selectedOperation = response.data.query.selectedOperation;

                if (transformedData) {
                  url = this.environmentService.hydrate(response.data.query.url, {
                    activeEnvironment: transformedData.environment
                  });
                  variables = this.environmentService.hydrate(response.data.variables.variables, {
                    activeEnvironment: transformedData.environment
                  });
                  headers = this.environmentService.hydrateHeaders(response.data.headers, {
                    activeEnvironment: transformedData.environment
                  });
                }

                // If the URL is not set or is invalid, just return
                if (!url || !validUrl.isUri(url)) {

                  this.notifyService.error('The URL is invalid!');
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

                  this.store.dispatch(
                    new queryActions.SetQueryOperationsAction(response.windowId, { operations: operationData.operations })
                  );
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
                    catchError((error: any) => {
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
              catchError((error: any) => {
                debug.error('Error sending the request', error);
                return observableEmpty();
              }),
            );
        }),
      );

    @Effect()
    // Shows the URL set alert after the URL is set
    showUrlSetAlert$: Observable<queryActions.Action> = this.actions$
    .pipe(
      ofType(queryActions.SET_URL),
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
      .pipe(
        ofType(gqlSchemaActions.SET_INTROSPECTION, gqlSchemaActions.SET_INTROSPECTION_FROM_DB),
        switchMap((data: queryActions.Action) => {
            const schema = this.gqlService.getIntrospectionSchema(data.payload);

            if (schema) {
              return observableOf(new gqlSchemaActions.SetSchemaAction(data.windowId, schema));
            }

            return observableEmpty();
        })
      );

    // Sets the schema SDL after setting the schema
    @Effect()
    setSchemaSDL$: Observable<Action> = this.actions$
      .pipe(
        ofType(gqlSchemaActions.SET_SCHEMA),
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
      .pipe(
        ofType(gqlSchemaActions.LOAD_SDL_SCHEMA),
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
      );

    @Effect()
    getIntrospectionForUrl$: Observable<Action> = this.actions$
      .pipe(
        ofType(queryActions.SEND_INTROSPECTION_QUERY_REQUEST),
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(response => {
          return this.getPrerequesstTransformedData$(response);
        }),
        switchMap((res) => {
          if (!res) {
            return observableEmpty();
          }
          const { response, transformedData } = res;
          let url = this.environmentService.hydrate(response.data.query.url);
          let headers = this.environmentService.hydrateHeaders(response.data.headers);

          if (transformedData) {
            url = this.environmentService.hydrate(response.data.query.url, {
              activeEnvironment: transformedData.environment
            });
            headers = this.environmentService.hydrateHeaders(response.data.headers, {
              activeEnvironment: transformedData.environment
            });
          }

          if (!url) {
            return observableEmpty();
          }

          this.store.dispatch(new docsAction.StartLoadingDocsAction(response.windowId));
          return this.gqlService
            .getIntrospectionRequest(url, {
              method: response.data.query.httpVerb,
              headers
            })
            .pipe(
              catchError((err: any) => {
                this.store.dispatch(new docsAction.StopLoadingDocsAction(response.windowId));
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
                  this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(false, response.windowId));
                } else {
                  this.notifyService.warning(`
                    Seems like something is broken. Please check that the URL is valid,
                    and the server is up and running properly.
                  `);
                }
                return observableEmpty();
              }),
              map(introspectionResponse => {
                this.store.dispatch(new docsAction.StopLoadingDocsAction(response.windowId));
                const introspectionData = introspectionResponse.body && introspectionResponse.body.data;
                const streamUrl = introspectionResponse.headers
                  && introspectionResponse.headers.get('X-GraphQL-Event-Stream'); // || '/graphql/stream'; // For development.
                this.store.dispatch(new streamActions.SetStreamSettingAction(response.windowId, { streamUrl }));
                if (streamUrl) {
                  this.store.dispatch(new streamActions.StartStreamClientAction(response.windowId));
                }
                if (!introspectionData) {
                  return new gqlSchemaActions.SetIntrospectionAction(introspectionData, response.windowId);
                }

                this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(true, response.windowId));

                return new gqlSchemaActions.SetIntrospectionAction(introspectionData, response.windowId);
              }),
              catchError((error: any) => {
                debug.error(error);
                return observableEmpty();
              })
            );
        }),
      );

    @Effect()
    notifyExperimental$: Observable<Action> = this.actions$
      .pipe(
        ofType(layoutActions.NOTIFY_EXPERIMENTAL),
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
        })
      );

    @Effect()
    downloadResult$: Observable<queryActions.Action> = this.actions$
      .pipe(
        ofType(queryActions.DOWNLOAD_RESULT),
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
      .pipe(
        ofType(queryActions.START_SUBSCRIPTION),
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          let connectionParams = undefined;
          const subscriptionUrl = this.environmentService.hydrate(res.data.query.subscriptionUrl);
          const query = this.environmentService.hydrate(res.data.query.query);
          const variables = this.environmentService.hydrate(res.data.variables.variables);
          let variablesObj = undefined;
          let selectedOperation = res.data.query.selectedOperation;

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
            if (variables) {
              variablesObj = JSON.parse(variables);
            }
          } catch (err) {
            return subscriptionErrorHandler(err, 'Your variables is not a valid JSON object.');
          }

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
              variables: variablesObj,
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
      .pipe(
        ofType(queryActions.STOP_SUBSCRIPTION),
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
      .pipe(
        ofType(queryActions.PRETTIFY_QUERY),
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
      .pipe(
        ofType(queryActions.COMPRESS_QUERY),
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
      .pipe(
        ofType(gqlSchemaActions.EXPORT_SDL),
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
      .pipe(
        ofType(queryActions.COPY_AS_CURL),
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
      .pipe(
        ofType(queryActions.CONVERT_TO_NAMED_QUERY),
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
      .pipe(
        ofType(queryActions.SEND_QUERY_REQUEST),
        switchMap((data: queryActions.Action) => {
          this.donationService.trackAndCheckIfEligible().subscribe(shouldShow => {
            if (shouldShow) {
              this.store.dispatch(new donationAction.ShowDonationAlertAction());
            }
          });
          return observableEmpty();
        })
      );

    @Effect()
    startStreamClient$: Observable<streamActions.Action> = this.actions$
      .pipe(
        ofType(streamActions.START_STREAM_CLIENT),
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
      .pipe(
        ofType(streamActions.STOP_STREAM_CLIENT),
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
      private notifyService: NotifyService,
      private dbService: DbService,
      private donationService: DonationService,
      private electronAppService: ElectronAppService,
      private environmentService: EnvironmentService,
      private preRequestService: PreRequestService,
      private store: Store<any>
    ) {}


    getPrerequesstTransformedData$(input: EffectResponseData) {
      return observableOf(input).pipe(
        switchMap(response => {
          if (!response) {
            return observableEmpty();
          }
          const query = response.data.query.query.trim();
          /**
           * pre request execution context is passed the current headers, environment, variables, query, etc
           * and returns a set of the same that would have potentially been modified during the script execution.
           * The returned data is used instead of the original set of data
           */
          return iif(
            () => response.data.preRequest.enabled,
            Observable.create((subscriber) => {
              try {
                this.preRequestService.executeScript(response.data.preRequest.script, {
                  environment: this.environmentService.getActiveEnvironment(),
                  headers: response.data.headers,
                  query,
                  variables: response.data.variables.variables,
                }).then(transformedData => {
                  subscriber.next({ response, transformedData });
                  subscriber.complete();
                }).catch(error => {
                  debug.error(error);
                  this.notifyService.error(error.message, 'Pre-request error');
                  subscriber.next(null);
                  subscriber.complete();
                });
              } catch (err) {
                debug.error(err);
                this.notifyService.error(err.message, 'Pre-request error');
                subscriber.next(null);
                subscriber.complete();
              }
            }) as Observable<{ response: typeof response, transformedData }>,
            observableOf({ response, transformedData: null })
          );
        }),
      );
    }
}
