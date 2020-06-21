
import {of as observableOf, empty as observableEmpty, Observable, iif, Subscriber } from 'rxjs';

import { tap, catchError, withLatestFrom, switchMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, ofType } from '@ngrx/effects';

const validUrl = require('valid-url');

import {
  GqlService,
  NotifyService,
  DbService,
  DonationService,
  ElectronAppService,
  EnvironmentService,
  PreRequestService
} from '../services';
import * as fromRoot from '../store';

import * as queryActions from '../store/query/query.action';
import * as variablesActions from '../store/variables/variables.action';
import * as layoutActions from '../store/layout/layout.action';
import * as gqlSchemaActions from '../store/gql-schema/gql-schema.action';
import * as docsAction from '../store/docs/docs.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import * as donationAction from '../store/donation/donation.action';
import * as historyActions from '../store/history/history.action';
import * as dialogsActions from '../store/dialogs/dialogs.action';
import * as streamActions from '../store/stream/stream.action';

import { downloadJson, downloadData, copyToClipboard, openFile } from '../utils';
import { debug } from '../utils/logger';
import { generateCurl } from 'app/utils/curl';

interface EffectResponseData {
  state: fromRoot.State;
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
            return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(response => {

          if (response.action.type === queryActions.CANCEL_QUERY_REQUEST) {
              this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
              return observableEmpty();
          }

          const query = (response.data.query.query || '').trim();
          if (!query) {
            return observableEmpty();
          }

          return observableOf(response);
        }),
        switchMap(response => {
          return this.getPrerequestTransformedData$(response);
        }),
        switchMap((returnedData) => {
          if (!returnedData) {
            return observableEmpty();
          }

          return observableOf(returnedData)
            .pipe(
              switchMap((_returnedData) => {
                const { response, transformedData } = _returnedData;

                const query = (response.data.query.query || '').trim();
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
                  const queryEditorIsFocused = response.data.query.queryEditorState && response.data.query.queryEditorState.isFocused;
                  const operationData = this.gqlService.getSelectedOperationData({
                    query,
                    selectedOperation,
                    selectIfOneOperation: true,
                    queryCursorIndex: queryEditorIsFocused ? response.data.query.queryEditorState.cursorIndex : undefined,
                  });

                  this.store.dispatch(
                    new queryActions.SetQueryOperationsAction(response.windowId, { operations: operationData.operations })
                  );
                  selectedOperation = operationData.selectedOperation;
                  if (operationData.requestSelectedOperationFromUser) {
                    this.notifyService.error(
                      `You have more than one query operations.
                      You need to select the one you want to run from the dropdown.`
                    );
                    return observableEmpty();
                  }
                } catch (err) {
                  this.store.dispatch(new queryActions.SetSelectedOperationAction(response.windowId, { selectedOperation: '' }));
                  this.notifyService.error(err.message);
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

                if (this.gqlService.hasInvalidFileVariable(response.data.variables.files)) {
                  this.notifyService.error(`
                    You have some invalid file variables.<br><br>
                    You need to provide a file and file name, when uploading files.
                    Check your files in the variables section.<br><br>
                    Note: Files don't persist after restarting Altair.
                  `, 'Altair', {
                    disableTimeOut: true,
                  });
                }

                debug.log('Sending..');
                return this.gqlService
                  .sendRequest(url, {
                    query,
                    variables,
                    headers,
                    method: response.data.query.httpVerb,
                    selectedOperation,
                    files: response.data.variables.files,
                    withCredentials: response.state.settings['request.withCredentials'],
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
                      let output = 'Server Error. Check that your server is up and running.' +
                      ' You can check the console for more details on the network errors.';

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
            this.gqlService.getSDL(schema).then(sdl => {
              return this.store.dispatch(new gqlSchemaActions.SetSchemaSDLAction(action.windowId, { sdl }))
            })
            .catch(error => {
              debug.error(error);
              const errorMessage = error.message ? error.message : error.toString();
              this.notifyService.error(`Could not set schema SDL. Error: ${errorMessage}`);
            });
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
            } catch (error) {
              const errorMessage = error.message ? error.message : error.toString();
              this.notifyService.error(`There was a problem loading the schema. Error: ${errorMessage}`);
              debug.error('Error while loading schema', error);
            }
          });
          return observableEmpty();
        })
      );

    @Effect()
    getIntrospectionForUrl$: Observable<Action> = this.actions$
      .pipe(
        ofType(queryActions.SEND_INTROSPECTION_QUERY_REQUEST),
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(response => {
          return this.getPrerequestTransformedData$(response);
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
              headers,
              withCredentials: response.state.settings['request.withCredentials'],
            })
            .pipe(
              catchError((err: any) => {
                this.store.dispatch(new docsAction.StopLoadingDocsAction(response.windowId));
                const errorObj = err.error || err;
                const errorMessage = errorObj.message ? errorObj.message : err.message ? err.message : errorObj.toString();
                let allowsIntrospection = true;

                if (errorObj.errors) {
                  errorObj.errors.forEach((error: any) => {
                    if (error.code === 'GRAPHQL_VALIDATION_ERROR') {
                      allowsIntrospection = false;
                    }
                  });
                }

                // If the server does not support introspection
                if (!allowsIntrospection) {
                  this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(false, response.windowId));
                  this.notifyService.error(`
                    Looks like this server does not support introspection.
                    Please check with the server administrator.
                  `);
                } else {
                  this.notifyService.error(`
                    Seems like something is broken. Please check that the URL is valid,
                    and the server is up and running properly.
                    <br>
                    ${errorMessage}
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

                this.store.dispatch(new gqlSchemaActions.SetIntrospectionLastUpdatedAtAction(response.windowId, { epoch: Date.now() }));
                return new gqlSchemaActions.SetIntrospectionAction(introspectionData, response.windowId);
              }),
              catchError((error: any) => {
                debug.error(error);
                this.notifyService.error(error.message);
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
              `, undefined, {
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
          return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(response => {
          return this.getPrerequestTransformedData$(response);
        }),
        switchMap(res => {
          if (!res) {
            return observableEmpty();
          }
          const { response, transformedData } = res;
          let connectionParams = undefined;
          let subscriptionUrl = this.environmentService.hydrate(response.data.query.subscriptionUrl);
          let query = this.environmentService.hydrate(response.data.query.query || '');
          let variables = this.environmentService.hydrate(response.data.variables.variables);
          let variablesObj = undefined;
          let selectedOperation = response.data.query.selectedOperation;

          if (transformedData) {
            subscriptionUrl = this.environmentService.hydrate(response.data.query.subscriptionUrl, {
              activeEnvironment: transformedData.environment
            });
            query = this.environmentService.hydrate(response.data.query.query || '', {
              activeEnvironment: transformedData.environment
            });
            variables = this.environmentService.hydrate(response.data.variables.variables, {
              activeEnvironment: transformedData.environment
            });
          }

          const subscriptionErrorHandler = (err: Error | Error[], errMsg?: string) => {
            if (Array.isArray(err)) {
              err = err[0];
            }
            errMsg = errMsg || err.message || err.stack;
            this.notifyService.error(`
              An error occurred in subscription.<br>
              Error: ${errMsg}
            `);
            this.store.dispatch(new queryActions.StopSubscriptionAction(response.windowId));
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
            const queryEditorIsFocused = response.data.query.queryEditorState && response.data.query.queryEditorState.isFocused;
            const operationData = this.gqlService.getSelectedOperationData({
              query,
              selectedOperation,
              queryCursorIndex: queryEditorIsFocused ? response.data.query.queryEditorState.cursorIndex : undefined,
              selectIfOneOperation: true,
            });

            this.store.dispatch(new queryActions.SetQueryOperationsAction(response.windowId, { operations: operationData.operations }));
            selectedOperation = operationData.selectedOperation;
          } catch (err) {
            this.store.dispatch(new queryActions.SetSelectedOperationAction(response.windowId, { selectedOperation: '' }));
            this.notifyService.error(err.message);
            return observableEmpty();
          }

          try {
            // Stop any currently active subscription
            this.gqlService.closeSubscriptionClient(response.data.query.subscriptionClient);


            try {
              const subscriptionConnectionParams = this.environmentService.hydrate(response.data.query.subscriptionConnectionParams);

              connectionParams =
                subscriptionConnectionParams ? JSON.parse(subscriptionConnectionParams) : undefined;
            } catch (err) {
              this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(response.windowId));
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
            subscriptionClient.request({
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

                this.store.dispatch(new queryActions.AddSubscriptionResponseAction(response.windowId, {
                  response: strData,
                  responseObj: data,
                  responseTime: (new Date()).getTime(), // store responseTime in ms
                }));

                // Send notification in electron app
                this.notifyService.pushNotify(strData, response.data.layout.title, {
                  onclick: () => {
                    this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId: response.windowId }));
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

            return observableOf(new queryActions.SetSubscriptionClientAction(response.windowId, { subscriptionClient }));
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
          this.gqlService.prettify(res.data.query.query || '', res.settings.tabSize).then(prettified => {
            if (prettified) {
              return this.store.dispatch(new queryActions.SetQueryAction(prettified, res.windowId));
            }
          })
          .catch((error) => {
            debug.log(error);
            const errorMessage = error.message ? error.message : error.toString();
            this.notifyService.error(`Your query does not appear to be valid. Please check it. Error: ${errorMessage}`);
          });

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
          debug.log('We compress..');
          this.gqlService.compress(res.data.query.query).then(compressed => {
            debug.log('Compressed..');

            if (compressed) {
              return this.store.dispatch(new queryActions.SetQueryAction(compressed, res.windowId));
            }
          })
          .catch(error => {
            debug.log(error);
            const errorMessage = error.message ? error.message : error.toString();
            this.notifyService.error(`Your query does not appear to be valid. Please check it. Error: ${errorMessage}`);
          });

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
            this.gqlService.getSDL(res.data.schema.schema).then(sdl => {
              if (sdl) {
                downloadData(sdl, 'sdl', { fileType: 'gql' });
              }
            })
            .catch(error => {
              const errorMessage = error.message ? error.message : error.toString();
              this.notifyService.error(`Could not export SDL. Your schema might be invalid. Error: ${errorMessage}`);
            });
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
          const query = this.environmentService.hydrate(res.data.query.query || '');
          const variables = this.environmentService.hydrate(res.data.variables.variables);
          try {
            const curlCommand = generateCurl({
              url,
              method: res.data.query.httpVerb,
              headers: res.data.headers.reduce((acc, cur) => {
                acc[cur.key] = this.environmentService.hydrate(cur.value);
                return acc;
              }, {} as any),
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
            if (namedQuery) {
              return observableOf(new queryActions.SetQueryAction(namedQuery, res.windowId));
            }
          } catch (error) {
            debug.log(error);
            const errorMessage = error.message ? error.message : error.toString();
            this.notifyService.error(`Your query does not appear to be valid. Please check it. Error: ${errorMessage}`);
          }

          return observableEmpty();
        }),
      );

    @Effect()
    refactorQuery$: Observable<Action> = this.actions$
      .pipe(
        ofType(queryActions.REFACTOR_QUERY),
        withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
          return { data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(res => {
          try {
            if (res.data.query.query && res.data.schema.schema) {
              const refactorResult = this.gqlService.refactorQuery(res.data.query.query, res.data.schema.schema);
              if (refactorResult && refactorResult.query) {
                try {
                  this.store.dispatch(new variablesActions.UpdateVariablesAction(JSON.stringify({
                    ...JSON.parse(res.data.variables.variables),
                    ...refactorResult.variables,
                  }, null, 2), res.windowId));
                } catch (err) {
                  this.notifyService.error('Looks like your variables are not formatted properly');
                  return observableEmpty();
                }
                return observableOf(new queryActions.SetQueryAction(refactorResult.query, res.windowId));
              }
            }
          } catch (error) {
            debug.log(error);
            const errorMessage = error.message ? error.message : error.toString();
            this.notifyService.error(`Your query does not appear to be valid. Please check it. Error: ${errorMessage}`);
          }

          return observableEmpty();
        }),
      );

    @Effect()
    showDonationAlert$: Observable<Action> = this.actions$
      .pipe(
        ofType(queryActions.SEND_QUERY_REQUEST),
        switchMap(() => {
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
            if (res.data.stream.client) {
              this.gqlService.closeStreamClient(res.data.stream.client);
            }

            const streamClient = this.gqlService.createStreamClient(streamUrl.href);
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
              const backoffTimeout = setTimeout(() => {
                backoff = Math.min(backoff * 1.7, 30000);
                this.store.dispatch(new streamActions.StartStreamClientAction(res.windowId, { backoff }));
                clearTimeout(backoffTimeout);
              }, backoff);
            }, false);

            return observableOf(new streamActions.SetStreamClientAction(res.windowId, { streamClient }));
          } catch (err) {
            debug.error('An error occurred starting the stream.', err);
            return observableEmpty();
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
          if (res.data.stream.client) {
            this.gqlService.closeStreamClient(res.data.stream.client);
          }
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


    getPrerequestTransformedData$(input: EffectResponseData) {
      return observableOf(input).pipe(
        switchMap(response => {
          if (!response) {
            return observableEmpty();
          }
          const query = (response.data.query.query || '').trim();
          /**
           * pre request execution context is passed the current headers, environment, variables, query, etc
           * and returns a set of the same that would have potentially been modified during the script execution.
           * The returned data is used instead of the original set of data
           */
          return iif(
            () => response.data.preRequest.enabled,
            Observable.create((subscriber: Subscriber<any>) => {
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
            }) as Observable<{ response: typeof response, transformedData: any }>,
            observableOf({ response, transformedData: null })
          );
        }),
      );
    }
}
