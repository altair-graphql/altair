import { of as observableOf, EMPTY, of, from, combineLatest, forkJoin } from 'rxjs';

import {
  catchError,
  withLatestFrom,
  switchMap,
  map,
  takeUntil,
  mergeMap,
  take,
  filter,
  finalize,
} from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';

import {
  GqlService,
  NotifyService,
  DbService,
  DonationService,
  ElectronAppService,
  EnvironmentService,
  QueryService,
  ApiService,
} from '../services';

import * as queryActions from '../store/query/query.action';
import * as variablesActions from '../store/variables/variables.action';
import * as layoutActions from '../store/layout/layout.action';
import * as localActions from '../store/local/local.action';
import * as gqlSchemaActions from '../store/gql-schema/gql-schema.action';
import * as docsAction from '../store/docs/docs.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import * as donationAction from '../store/donation/donation.action';
import * as historyActions from '../store/history/history.action';
import * as dialogsActions from '../store/dialogs/dialogs.action';
import * as streamActions from '../store/stream/stream.action';
import * as collectionActions from '../store/collection/collection.action';

import {
  downloadData,
  copyToClipboard,
  openFile,
  isValidUrl,
  parseJson,
} from '../utils';
import { debug } from '../utils/logger';
import { generateCurl } from '../utils/curl';
import { OperationDefinitionNode } from 'graphql';
import { UnknownError } from '../interfaces/shared';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { RequestScriptError } from '../services/pre-request/errors';
import { BATCHED_REQUESTS_OPERATION } from '../services/gql/gql.service';
import { RequestType } from 'altair-graphql-core/build/script/types';
import { QueryResponse } from 'altair-graphql-core/build/types/state/query.interfaces';
import { buildResponse } from 'altair-graphql-core/build/request/response-builder';

function notNullOrUndefined<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

@Injectable()
export class QueryEffects {
  private actions$ = inject(Actions);
  private gqlService = inject(GqlService);
  private notifyService = inject(NotifyService);
  private dbService = inject(DbService);
  private donationService = inject(DonationService);
  private electronAppService = inject(ElectronAppService);
  private environmentService = inject(EnvironmentService);
  private queryService = inject(QueryService);
  private apiService = inject(ApiService);
  private store = inject<Store<RootState>>(Store);

  // TODO: Move more logic into query service
  // Sends the query request to the specified URL
  // with the specified headers and variables
  // NOTE: Should use mergeMap instead of switchMap, because switchMap cancels the previous request
  sendQueryRequest$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.SEND_QUERY_REQUEST, queryActions.CANCEL_QUERY_REQUEST),
        withLatestFrom(
          this.store,
          (
            action:
              | queryActions.SendQueryRequestAction
              | queryActions.CancelQueryRequestAction,
            state: RootState
          ) => {
            return {
              state,
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        map((response) => {
          // cancel requests
          if (response.action.type === queryActions.CANCEL_QUERY_REQUEST) {
            this.store.dispatch(
              new layoutActions.StopLoadingAction(response.windowId)
            );
            return;
          }

          const data = response.data;
          if (!data) {
            return;
          }

          const query = (response.data?.query.query ?? '').trim();
          if (!query) {
            return;
          }

          return {
            ...response,
            data,
          };
        }),
        filter(notNullOrUndefined),
        mergeMap((response) => {
          this.store.dispatch(
            new layoutActions.StartLoadingAction(response.windowId)
          );
          this.store.dispatch(
            new localActions.SetWindowLoadingRequestStateAction({
              windowId: response.windowId,
              loadingRequestState: [
                {
                  source: 'window',
                  sourceId: response.windowId,
                  type: 'query',
                },
              ],
            })
          );
          return forkJoin({
            response: of(response),
            transformedData: from(
              this.queryService.getPrerequestTransformedData(response.windowId)
            ),
            handler: from(
              this.queryService.getRequestHandler(
                response.data,
                this.gqlService.isSubscriptionQuery(
                  response.data.query.query ?? '',
                  response.data
                )
              )
            ),
          }).pipe(
            mergeMap(({ response, transformedData, handler }) => {
              const preRequestScriptLogs = transformedData?.requestScriptLogs;
              const isSubscriptionQuery = this.gqlService.isSubscriptionQuery(
                response.data.query.query ?? '',
                response.data
              );
              const {
                url,
                variables,
                headers,
                extensions,
                query,
                subscriptionUrl,
                subscriptionConnectionParams,
                requestHandlerAdditionalParams,
              } = this.queryService.hydrateAllHydratables(
                response.data,
                transformedData
              );

              // If the URL is not set or is invalid, just return
              if (!url || !isValidUrl(url)) {
                this.notifyService.error('The URL is invalid!');
                this.store.dispatch(
                  new layoutActions.StopLoadingAction(response.windowId)
                );
                return EMPTY;
              }
              if (!parseJson(variables, null)) {
                this.notifyService.error(
                  'The variables is not a valid JSON string!'
                );
                this.store.dispatch(
                  new layoutActions.StopLoadingAction(response.windowId)
                );
                return EMPTY;
              }

              if (
                this.gqlService.hasInvalidFileVariable(response.data.variables.files)
              ) {
                this.notifyService.error(
                  `
                    You have some invalid file variables.<br><br>
                    You need to provide a file and file name, when uploading files.
                    Check your files in the variables section.
                  `,
                  'Altair',
                  {
                    disableTimeOut: true,
                  }
                );
                return EMPTY;
              }
              const {
                selectedOperation,
                operations,
                error: selectedOperationError,
              } = this.gqlService.calculateSelectedOperation(response.data, query);
              if (selectedOperationError) {
                this.notifyService.error(selectedOperationError);
                return EMPTY;
              }
              this.store.dispatch(
                new queryActions.SetSelectedOperationAction(response.windowId, {
                  selectedOperation: selectedOperation ?? '',
                })
              );
              if (operations) {
                this.store.dispatch(
                  new queryActions.SetQueryOperationsAction(response.windowId, {
                    operations,
                  })
                );
              }

              // Try to store the current query into the history if it does not already exist in the history
              this.store.dispatch(
                new historyActions.TryAddHistoryAction({
                  windowId: response.windowId,
                  query,
                  limit: response.state.settings.historyDepth,
                })
              );

              // perform some cleanup of previous state
              this.store.dispatch(
                new queryActions.SetRequestScriptLogsAction(response.windowId, [])
              );
              this.store.dispatch(
                new queryActions.SetQueryResponsesAction(response.windowId, {
                  responses: [],
                })
              );

              // If the query is a subscription, subscribe to the subscription URL and send the query
              if (isSubscriptionQuery) {
                debug.log('Your query is a SUBSCRIPTION!!!');
                // If the subscription URL is not set, show the dialog for the user to set it
                if (!response.data.query.subscriptionUrl) {
                  this.store.dispatch(
                    new dialogsActions.ToggleRequestHandlerDialogAction(
                      response.windowId,
                      { value: true }
                    )
                  );
                  return EMPTY;
                }
              }

              this.store.dispatch(
                new queryActions.SetIsSubscribedAction(response.windowId, {
                  isSubscribed: isSubscriptionQuery,
                })
              );

              let requestStatusCode = 0;
              let requestStatusText = '';
              const responses: QueryResponse[] = [];

              this.store.dispatch(
                new localActions.UpdateWindowLoadingRequestEntryStateAction({
                  windowId: response.windowId,
                  entry: {
                    source: 'window',
                    sourceId: response.windowId,
                    type: 'query',
                    state: 'active',
                  },
                })
              );
              debug.log('Sending..');
              return this.gqlService
                .sendRequestV2({
                  url: isSubscriptionQuery ? subscriptionUrl ?? url : url,
                  query,
                  variables,
                  extensions,
                  headers,
                  method: response.data.query.httpVerb,
                  selectedOperation,
                  files: response.data.variables.files,
                  withCredentials:
                    response.state.settings['request.withCredentials'],
                  batchedRequest:
                    response.data.query.selectedOperation ===
                    BATCHED_REQUESTS_OPERATION,
                  handler,
                  additionalParams: isSubscriptionQuery
                    ? subscriptionConnectionParams
                    : requestHandlerAdditionalParams,
                  windowId: response.windowId,
                })
                .pipe(
                  switchMap((res) => {
                    if (!isSubscriptionQuery) {
                      // Subscription requests are long lived, so we don't set them to done here
                      this.store.dispatch(
                        new localActions.UpdateWindowLoadingRequestEntryStateAction({
                          windowId: response.windowId,
                          entry: {
                            state: 'done',
                            source: 'window',
                            sourceId: response.windowId,
                            type: 'query',
                          },
                        })
                      );
                    }
                    return combineLatest([
                      of(res),
                      from(
                        this.queryService.getPostRequestTransformedData(
                          response.windowId,
                          isSubscriptionQuery
                            ? RequestType.SUBSCRIPTION
                            : RequestType.QUERY,
                          res
                        )
                      ),
                    ]).pipe(
                      map(([data, transformedData]) => {
                        return { data, transformedData };
                      })
                    );
                  }),
                  map((res) => {
                    if (!res) {
                      return null;
                    }
                    requestStatusCode = res.data.status;
                    requestStatusText = res.data.statusText;
                    return res;
                  }),
                  map((result) => {
                    const responseBody = result?.data.body;
                    // attempt to parse the response body as JSON
                    const parsedResponseBody = responseBody
                      ? parseJson(responseBody, responseBody)
                      : undefined;

                    const responseContent =
                      typeof parsedResponseBody === 'string'
                        ? parsedResponseBody
                        : JSON.stringify(parsedResponseBody, null, 2);

                    responses.push({
                      content: responseContent,
                      timestamp: result?.data.requestEndTime ?? Date.now(),
                      json: !!parsedResponseBody,
                    });

                    const builtResponse = buildResponse(
                      responses,
                      response.state.settings['response.stream.strategy']
                    );
                    this.store.dispatch(
                      new queryActions.SetQueryResponsesAction(response.windowId, {
                        responses: builtResponse,
                      })
                    );

                    if (isSubscriptionQuery) {
                      // Send notification in electron app
                      this.notifyService.pushNotify(
                        responseContent,
                        response.data?.layout.title,
                        {
                          onclick: () => {
                            this.store.dispatch(
                              new windowsMetaActions.SetActiveWindowIdAction({
                                windowId: response.windowId,
                              })
                            );
                          },
                        }
                      );
                    }

                    this.store.dispatch(
                      new queryActions.AppendRequestScriptLogsAction(
                        response.windowId,
                        [
                          ...(preRequestScriptLogs || []),
                          ...(result?.transformedData?.requestScriptLogs || []),
                        ]
                      )
                    );
                    this.store.dispatch(
                      new queryActions.SetQueryResultResponseHeadersAction(
                        response.windowId,
                        { headers: result?.data.headers }
                      )
                    );
                    return result;
                  }),
                  takeUntil(
                    this.actions$.pipe(
                      ofType(queryActions.CANCEL_QUERY_REQUEST),
                      filter(
                        (action: queryActions.CancelQueryRequestAction) =>
                          action.windowId === response.windowId
                      )
                    )
                  ),
                  catchError((error) => {
                    let output =
                      'Server Error. Check that your server is up and running.' +
                      ' You can check the console for more details on the network errors.';

                    debug.log(error);
                    requestStatusCode = error.status;
                    requestStatusText = error.statusText;

                    if (error instanceof RequestScriptError) {
                      output = `${error.name}: ${error.message}`;
                    } else if (error.status) {
                      output = error.error;
                    } else if (error.message) {
                      output = error.message;
                    }

                    this.store.dispatch(
                      new queryActions.SetQueryResponsesAction(response.windowId, {
                        responses: [
                          {
                            content: output,
                            timestamp: Date.now(),
                          },
                        ],
                      })
                    );
                    return of(null);
                  }),
                  map((res) => {
                    this.store.dispatch(
                      new queryActions.SetResponseStatsAction(response.windowId, {
                        responseStatus: requestStatusCode,
                        responseTime: res?.data ? res.data.responseTime : 0,
                        requestStartTime: res?.data ? res.data.requestStartTime : 0,
                        requestEndTime: res?.data ? res.data.requestEndTime : 0,
                        responseStatusText: requestStatusText,
                      })
                    );
                  }),
                  catchError((error: UnknownError) => {
                    debug.error('Error sending the request', error);
                    return EMPTY;
                  })
                );
            }),
            finalize(() => {
              this.store.dispatch(
                new layoutActions.StopLoadingAction(response.windowId)
              );
            }),
            catchError((error: UnknownError) => {
              debug.error('Error sending the request', error);
              return EMPTY;
            })
          );
        })
      );
    },
    { dispatch: false }
  );

  // perform some cleanup when stopping loading
  stopLoading$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(layoutActions.STOP_LOADING),
        mergeMap((action: layoutActions.StopLoadingAction) => {
          this.store.dispatch(
            new queryActions.SetIsSubscribedAction(action.windowId, {
              isSubscribed: false,
            })
          );
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  // Shows the URL set alert after the URL is set
  showUrlSetAlert$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.SET_URL),
        mergeMap((data: queryActions.SetUrlAction) => {
          const url = this.environmentService.hydrate(data.payload.url);
          // If the URL is not valid
          if (!isValidUrl(url)) {
            this.notifyService.error('The URL is invalid!');
          } else {
            this.notifyService.success('URL has been set.');
          }

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  // Gets the gql schema after the introspection is set
  getGqlSchema$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        gqlSchemaActions.SET_INTROSPECTION,
        gqlSchemaActions.SET_INTROSPECTION_FROM_DB
      ),
      mergeMap((data: gqlSchemaActions.SetIntrospectionAction) => {
        const schema = this.gqlService.getIntrospectionSchema(data.payload);

        if (schema) {
          return observableOf(
            new gqlSchemaActions.SetSchemaAction(data.windowId, schema)
          );
        }

        return EMPTY;
      })
    );
  });

  // Sets the schema SDL after setting the schema
  setSchemaSDL$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(gqlSchemaActions.SET_SCHEMA),
        mergeMap((action: gqlSchemaActions.SetSchemaAction) => {
          const schema = action.payload;
          if (schema) {
            this.gqlService
              .getSDL(schema)
              .then((sdl) => {
                return this.store.dispatch(
                  new gqlSchemaActions.SetSchemaSDLAction(action.windowId, {
                    sdl,
                  })
                );
              })
              .catch((error) => {
                debug.error(error);
                this.notifyService.errorWithError(
                  error,
                  `Could not set schema SDL.`
                );
              });
          }

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  loadSDLSchema$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(gqlSchemaActions.LOAD_SDL_SCHEMA),
        mergeMap((data: gqlSchemaActions.LoadSDLSchemaAction) => {
          openFile({ accept: ['.gql', '.graphql'] }).then((sdlData: string) => {
            try {
              const schema = this.gqlService.sdlToSchema(sdlData);
              if (schema) {
                this.notifyService.success('Loaded schema successfully');
                return this.store.dispatch(
                  new gqlSchemaActions.SetSchemaAction(data.windowId, schema)
                );
              }
            } catch (error) {
              debug.error(error);
              this.notifyService.errorWithError(
                error,
                `There was a problem loading the schema.`
              );
              debug.error('Error while loading schema', error);
            }
          });
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  getIntrospectionForUrl$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.SEND_INTROSPECTION_QUERY_REQUEST),
        withLatestFrom(
          this.store,
          (
            action: queryActions.SendIntrospectionQueryRequestAction,
            state: RootState
          ) => {
            return {
              state,
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        mergeMap((response) => {
          this.store.dispatch(
            new docsAction.StartLoadingDocsAction(response.windowId)
          );
          return combineLatest([
            of(response),
            from(this.queryService.getPrerequestTransformedData(response.windowId)),
            from(
              response.data
                ? this.queryService.getRequestHandler(response.data, false)
                : EMPTY
            ),
          ]).pipe(
            mergeMap(([response, transformedData, handler]) => {
              if (!handler) {
                return EMPTY;
              }
              if (!response.data) {
                return EMPTY;
              }

              const { url, headers, requestHandlerAdditionalParams } =
                this.queryService.hydrateAllHydratables(
                  response.data,
                  transformedData
                );

              if (!url) {
                return EMPTY;
              }

              return this.gqlService
                .getIntrospectionRequest({
                  url,
                  method: response.data.query.httpVerb,
                  headers,
                  variables: '{}',
                  extensions: '',
                  withCredentials:
                    response.state.settings['request.withCredentials'],
                  handler,
                  additionalParams: requestHandlerAdditionalParams,
                  windowId: response.windowId,
                  descriptions:
                    response.state.settings['introspection.options.description'],
                  specifiedByUrl:
                    response.state.settings['introspection.options.specifiedByUrl'],
                  directiveIsRepeatable:
                    response.state.settings[
                      'introspection.options.directiveIsRepeatable'
                    ],
                  schemaDescription:
                    response.state.settings[
                      'introspection.options.schemaDescription'
                    ],
                  inputValueDeprecation:
                    response.state.settings[
                      'introspection.options.inputValueDeprecation'
                    ],
                })
                .pipe(
                  switchMap((introspectionResponse) => {
                    return combineLatest([
                      of(introspectionResponse),
                      from(
                        this.queryService.getPostRequestTransformedData(
                          response.windowId,
                          RequestType.INTROSPECTION,
                          introspectionResponse
                        )
                      ),
                    ]).pipe(
                      map(([data, transformedData]) => {
                        return { data, transformedData };
                      })
                    );
                  }),
                  catchError(
                    (
                      err: UnknownError<
                        { error: Error } | { errors: { code: string }[] }
                      >
                    ) => {
                      this.store.dispatch(
                        new docsAction.StopLoadingDocsAction(response.windowId)
                      );
                      let allowsIntrospection = true;
                      if (typeof err === 'object') {
                        const errorObj = 'error' in err ? err.error : err;

                        if ('errors' in errorObj) {
                          errorObj.errors.forEach((error) => {
                            if (error.code === 'GRAPHQL_VALIDATION_ERROR') {
                              allowsIntrospection = false;
                            }
                          });
                        }
                      }

                      // If the server does not support introspection
                      if (!allowsIntrospection) {
                        this.store.dispatch(
                          new gqlSchemaActions.SetAllowIntrospectionAction(
                            false,
                            response.windowId
                          )
                        );
                        this.notifyService.error(`
                        Looks like this server does not support introspection.
                        Please check with the server administrator.
                      `);
                      } else {
                        this.notifyService.errorWithError(
                          err,
                          `
                        Seems like something is broken. Please check that the URL is valid,
                        and the server is up and running properly.
                      `
                        );
                      }
                      return of(null);
                    }
                  ),
                  map((postRequestTransformData) => {
                    this.store.dispatch(
                      new docsAction.StopLoadingDocsAction(response.windowId)
                    );
                    if (!postRequestTransformData) {
                      return EMPTY;
                    }

                    const introspectionData = parseJson(
                      postRequestTransformData.data.body ?? ''
                    )?.data;
                    const streamUrl =
                      postRequestTransformData.data.headers[
                        'X-GraphQL-Event-Stream'
                      ]; // || '/stream'; // For dev

                    // Check if new stream url is different from previous before setting it
                    if (
                      response.data?.stream.url !== streamUrl ||
                      !response.data?.stream.client
                    ) {
                      this.store.dispatch(
                        new streamActions.SetStreamSettingAction(response.windowId, {
                          streamUrl: streamUrl ?? '',
                        })
                      );
                      if (streamUrl) {
                        this.store.dispatch(
                          new streamActions.StartStreamClientAction(
                            response.windowId
                          )
                        );
                      } else {
                        this.store.dispatch(
                          new streamActions.StopStreamClientAction(response.windowId)
                        );
                      }
                    }

                    if (!introspectionData) {
                      this.store.dispatch(
                        new gqlSchemaActions.SetIntrospectionAction(
                          introspectionData,
                          response.windowId
                        )
                      );
                    } else {
                      this.store.dispatch(
                        new gqlSchemaActions.SetAllowIntrospectionAction(
                          true,
                          response.windowId
                        )
                      );

                      this.store.dispatch(
                        new gqlSchemaActions.SetIntrospectionLastUpdatedAtAction(
                          response.windowId,
                          { epoch: Date.now() }
                        )
                      );
                      this.store.dispatch(
                        new gqlSchemaActions.SetIntrospectionAction(
                          introspectionData,
                          response.windowId
                        )
                      );
                      this.notifyService.success('Reloaded doc successfully');
                    }

                    return EMPTY;
                  }),
                  catchError((error: UnknownError) => {
                    debug.error(error);
                    this.notifyService.errorWithError(
                      error,
                      'Error getting the introspection results.'
                    );
                    return EMPTY;
                  })
                );
            }),
            finalize(() => {
              this.store.dispatch(
                new docsAction.StopLoadingDocsAction(response.windowId)
              );
            })
          );
        })
      );
    },
    { dispatch: false }
  );

  notifyExperimental$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(layoutActions.NOTIFY_EXPERIMENTAL),
        switchMap(() => this.dbService.getItem('exp_add_query_seen')),
        switchMap((val) => {
          if (!val) {
            this.notifyService.info(
              `
              This feature is experimental, and still in beta.
              Click here to submit bugs, improvements, etc.
            `,
              undefined,
              {
                data: {
                  url: 'https://github.com/altair-graphql/altair/issues/new',
                },
              }
            );
            return this.dbService.setItem('exp_add_query_seen', true);
          }
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  clearResult$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.CLEAR_RESULT),
        withLatestFrom(
          this.store,
          (action: queryActions.ClearResultAction, state) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        switchMap((res) => {
          this.store.dispatch(
            new queryActions.SetQueryResponsesAction(res.windowId, {
              responses: [],
            })
          );
          this.store.dispatch(
            new queryActions.SetQueryResultResponseHeadersAction(res.windowId, {})
          );

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  downloadResult$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.DOWNLOAD_RESULT),
        withLatestFrom(
          this.store,
          (action: queryActions.DownloadResultAction, state) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        switchMap((res) => {
          const content = res.action.payload.content;
          downloadData(content, res.data?.layout.title, {
            fileType: parseJson(content, null) ? 'json' : 'txt',
          });

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  prettifyQuery$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.PRETTIFY_QUERY),
        withLatestFrom(
          this.store,
          (action: queryActions.PrettifyQueryAction, state: RootState) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
              settings: state.settings,
            };
          }
        ),
        switchMap((res) => {
          this.gqlService
            .prettify(res.data?.query.query ?? '', res.settings.tabSize)
            .then((prettified) => {
              if (prettified) {
                return this.store.dispatch(
                  new queryActions.SetQueryAction(prettified, res.windowId)
                );
              }
            })
            .catch((error) => {
              debug.log(error);
              this.notifyService.errorWithError(
                error,
                `Your query does not appear to be valid. Please check it`
              );
            });

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  compressQuery$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.COMPRESS_QUERY),
        withLatestFrom(
          this.store,
          (action: queryActions.CompressQueryAction, state) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        switchMap((res) => {
          debug.log('We compress..');
          this.gqlService
            .compress(res.data?.query.query || '')
            .then((compressed) => {
              debug.log('Compressed..');

              if (compressed) {
                return this.store.dispatch(
                  new queryActions.SetQueryAction(compressed, res.windowId)
                );
              }
            })
            .catch((error) => {
              this.notifyService.errorWithError(
                error,
                `Your query does not appear to be valid. Please check it.`
              );
            });

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  prettifyVariables$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(variablesActions.PRETTIFY_VARIABLES),
        withLatestFrom(
          this.store,
          (action: variablesActions.PrettifyVariablesAction, state: RootState) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
              settings: state.settings,
            };
          }
        ),
        switchMap((res) => {
          const variables = res.data?.variables.variables ?? '';
          try {
            const prettified = JSON.stringify(
              JSON.parse(variables),
              null,
              res.settings.tabSize
            );
            this.store.dispatch(
              new variablesActions.UpdateVariablesAction(prettified, res.windowId)
            );
          } catch (err) {
            this.notifyService.errorWithError(
              err,
              `Your variables does not appear to be valid. Please check it`
            );
          }

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  exportSDL$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(gqlSchemaActions.EXPORT_SDL),
        withLatestFrom(
          this.store,
          (action: gqlSchemaActions.Action, state: RootState) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        switchMap((res) => {
          if (res.data?.schema.schema) {
            this.gqlService
              .getSDL(res.data.schema.schema)
              .then((sdl) => {
                if (sdl) {
                  downloadData(sdl, 'sdl', { fileType: 'gql' });
                }
              })
              .catch((error) => {
                this.notifyService.errorWithError(
                  error,
                  `Could not export SDL. Your schema might be invalid.`
                );
              });
          }
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  copyAsCurl$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.COPY_AS_CURL),
        withLatestFrom(
          this.store,
          (action: queryActions.CopyAsCurlAction, state: RootState) => {
            return {
              data: state.windows[action.windowId],
              windowId: action.windowId,
              action,
            };
          }
        ),
        switchMap((response) => {
          return combineLatest([
            of(response),
            from(this.queryService.getPrerequestTransformedData(response.windowId)),
          ]).pipe(
            map(([response, transformedData]) => {
              return { response, transformedData };
            })
          );
        }),
        switchMap((res) => {
          if (!res) {
            return EMPTY;
          }
          const { response, transformedData } = res;
          if (!response.data) {
            return EMPTY;
          }

          const { query, variables, url } = this.queryService.hydrateAllHydratables(
            response.data,
            transformedData
          );
          const { resolvedFiles } = this.gqlService.normalizeFiles(
            response.data.variables.files
          );
          if (resolvedFiles.length) {
            this.notifyService.error(
              'This is not currently available with file variables'
            );
            return EMPTY;
          }

          try {
            const curlCommand = generateCurl({
              url,
              method: response.data.query.httpVerb,
              headers: response.data.headers.reduce((acc, cur) => {
                acc[cur.key] = this.environmentService.hydrate(cur.value, {
                  activeEnvironment: transformedData?.environment,
                });
                return acc;
              }, {} as any),
              data: {
                query,
                variables: parseJson(variables),
              },
            });
            debug.log(curlCommand);
            copyToClipboard(curlCommand);
            this.notifyService.success('Copied cURL command to clipboard.');
          } catch (err) {
            this.notifyService.errorWithError(err, 'Error while copying as curl');
          }
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  convertToNamedQuery$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(queryActions.CONVERT_TO_NAMED_QUERY),
      withLatestFrom(
        this.store,
        (action: queryActions.ConvertToNamedQueryAction, state) => {
          return {
            data: state.windows[action.windowId],
            windowId: action.windowId,
            action,
          };
        }
      ),
      switchMap((res) => {
        try {
          const namedQuery = this.gqlService.nameQuery(res.data?.query.query || '');
          if (namedQuery) {
            return observableOf(
              new queryActions.SetQueryAction(namedQuery, res.windowId)
            );
          }
        } catch (error) {
          this.notifyService.errorWithError(
            error,
            `Your query does not appear to be valid. Please check it.`
          );
        }

        return EMPTY;
      })
    );
  });

  refactorQuery$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(queryActions.REFACTOR_QUERY),
      withLatestFrom(
        this.store,
        (action: queryActions.RefactorQueryAction, state: RootState) => {
          return {
            data: state.windows[action.windowId],
            windowId: action.windowId,
            action,
          };
        }
      ),
      switchMap((res) => {
        try {
          if (!res.data) {
            return EMPTY;
          }
          if (res.data.query.query && res.data.schema.schema) {
            const refactorResult = this.gqlService.refactorQuery(
              res.data.query.query,
              res.data.schema.schema
            );
            if (refactorResult && refactorResult.query) {
              try {
                this.store.dispatch(
                  new variablesActions.UpdateVariablesAction(
                    JSON.stringify(
                      {
                        ...JSON.parse(res.data.variables.variables),
                        ...refactorResult.variables,
                      },
                      null,
                      2
                    ),
                    res.windowId
                  )
                );
              } catch (err) {
                this.notifyService.errorWithError(
                  err,
                  'Looks like your variables are not formatted properly'
                );
                return EMPTY;
              }
              return observableOf(
                new queryActions.SetQueryAction(refactorResult.query, res.windowId)
              );
            }
          }
        } catch (error) {
          this.notifyService.errorWithError(
            error,
            `Your query does not appear to be valid. Please check it.`
          );
        }

        return EMPTY;
      })
    );
  });

  showDonationAlert$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(queryActions.SEND_QUERY_REQUEST),
      switchMap(() => {
        return this.donationService.trackAndCheckIfEligible();
      }),
      switchMap((shouldShow) => {
        if (shouldShow) {
          return of(new donationAction.ShowDonationAlertAction());
        }
        return EMPTY;
      })
    );
  });

  startStreamClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(streamActions.START_STREAM_CLIENT),
      withLatestFrom(
        this.store,
        (action: streamActions.StartStreamClientAction, state: RootState) => {
          return {
            data: state.windows[action.windowId],
            windowId: action.windowId,
            action,
          };
        }
      ),
      switchMap((res) => {
        if (!res.data?.stream.url) {
          return EMPTY;
        }
        const endpoint = new URL(
          this.environmentService.hydrate(res.data.query.url)
        );
        const streamUrl = new URL(
          this.environmentService.hydrate(res.data.stream.url),
          endpoint
        );

        if (endpoint.host !== streamUrl.host) {
          this.notifyService.error(`
              The stream and endpoint domains do not match. Please check your server implementation.
              [${endpoint.host} != ${streamUrl.host}]
            `);
          return EMPTY;
        }
        try {
          // Stop any currently active stream client
          if (res.data.stream.client) {
            this.gqlService.closeStreamClient(res.data.stream.client);
          }
          let backoffTimeout = 0;

          const streamClient = this.gqlService.createStreamClient(streamUrl.href);
          let backoff = res.action.payload.backoff || 200;

          streamClient.addEventListener(
            'message',
            () => {
              clearTimeout(backoffTimeout);
              this.store.dispatch(
                new queryActions.SendIntrospectionQueryRequestAction(res.windowId)
              );
            },
            false
          );

          streamClient.addEventListener(
            'open',
            () => {
              // Clear error state
              this.store.dispatch(
                new streamActions.SetStreamFailedAction(res.windowId, {
                  failed: undefined,
                })
              );
              this.store.dispatch(
                new streamActions.SetStreamConnectedAction(res.windowId, {
                  connected: true,
                })
              );
              // Reset backoff
              backoff = 200;
              clearTimeout(backoffTimeout);
            },
            false
          );

          streamClient.addEventListener(
            'error',
            (err) => {
              this.store.dispatch(
                new streamActions.SetStreamFailedAction(res.windowId, {
                  failed: err,
                })
              );
              // Retry after sometime
              backoffTimeout = window.setTimeout(() => {
                backoff = Math.min(backoff * 1.7, 30000);
                this.store.dispatch(
                  new streamActions.StartStreamClientAction(res.windowId, {
                    backoff,
                  })
                );
                clearTimeout(backoffTimeout);
              }, backoff);
            },
            false
          );

          return observableOf(
            new streamActions.SetStreamClientAction(res.windowId, {
              streamClient,
            })
          );
        } catch (err) {
          debug.error('An error occurred starting the stream.', err);
          return EMPTY;
          // return subscriptionErrorHandler(err);
        }
      })
    );
  });

  stopStreamClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(streamActions.STOP_STREAM_CLIENT),
      withLatestFrom(
        this.store,
        (action: streamActions.Action, state: RootState) => {
          return {
            data: state.windows[action.windowId],
            windowId: action.windowId,
            action,
          };
        }
      ),
      switchMap((res) => {
        if (res.data?.stream.client) {
          this.gqlService.closeStreamClient(res.data.stream.client);
        }
        return observableOf(
          new streamActions.SetStreamClientAction(res.windowId, {
            streamClient: undefined,
          })
        );
      })
    );
  });

  setDynamicWindowTitle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(queryActions.SET_QUERY, queryActions.SET_QUERY_FROM_DB),
      withLatestFrom(
        this.store,
        (
          action: queryActions.SetQueryAction | queryActions.SetQueryFromDbAction,
          state: RootState
        ) => {
          return {
            data: state.windows[action.windowId],
            windowId: action.windowId,
            windowIds: state.windowsMeta.windowIds,
            action,
          };
        }
      ),
      switchMap((res) => {
        const query = res.data?.query.query;
        if (!res.data?.layout.hasDynamicTitle) {
          return EMPTY;
        }
        if (query) {
          const document = this.gqlService.parseQueryOrEmptyDocument(query);

          const currentDefinitionNames = document.definitions
            .filter(
              (definition): definition is OperationDefinitionNode =>
                definition.kind === 'OperationDefinition' &&
                Boolean(definition.name?.value)
            )
            .map((definition) => definition.name!.value);

          const dynamicName = currentDefinitionNames[0];
          if (currentDefinitionNames.length && dynamicName) {
            return of(
              new layoutActions.SetWindowNameAction(res.windowId, {
                title: dynamicName,
              })
            );
          }
        }
        return of(
          new layoutActions.SetWindowNameAction(res.windowId, {
            title: `Window ${res.windowIds.length}`,
          })
        );
      })
    );
  });

  restoreQueryRevision$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(queryActions.RESTORE_QUERY_REVISION),
        withLatestFrom(
          this.store,
          (action: queryActions.RestoreQueryRevisionAction, state: RootState) => {
            return {
              action,
            };
          }
        ),
        switchMap((res) => {
          const revisionId = res.action.payload.id;
          const queryId = res.action.payload.queryItemId;
          // Call API with revisionId and queryId
          return from(
            this.apiService.restoreQueryRevision(queryId, revisionId)
          ).pipe(take(1));
        }),
        switchMap(() => {
          this.store.dispatch(new collectionActions.LoadCollectionsAction());
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  tryAddHistory$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(historyActions.TRY_ADD_HISTORY),
        withLatestFrom(
          this.store,
          (action: historyActions.TryAddHistoryAction, state: RootState) => {
            return {
              data: state.windows[action.payload.windowId],
              windowId: action.payload.windowId,
              action,
            };
          }
        ),
        switchMap((res) => {
          if (!res.data) {
            return EMPTY;
          }

          const matchesPromise = res.data.history.list.map(async (item) => {
            try {
              return (
                (await this.gqlService.compress(item.query)) ===
                (await this.gqlService.compress(res.action.payload.query))
              );
            } catch (error) {
              debug.warn('Error while compressing query for history match', error);
              return false;
            }
          });

          return from(Promise.all(matchesPromise)).pipe(
            map((matches) => {
              if (!matches.includes(true)) {
                // If the query is not in history, add it
                this.store.dispatch(
                  new historyActions.AddHistoryAction(res.windowId, {
                    query: res.action.payload.query,
                    limit: res.action.payload.limit,
                  })
                );
              }
            })
          );
        })
      );
    },
    { dispatch: false }
  );
}
