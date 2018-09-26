import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as validUrl from 'valid-url';

import { GqlService, QueryService, NotifyService, DbService, DonationService, ElectronAppService } from '../services';
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

import { downloadJson, downloadData } from '../utils';
import { uaSeedHash } from '../utils/simple_hash';
import config from '../config';

@Injectable()
export class QueryEffects {

    @Effect()
    // Sends the query request to the specified URL
    // with the specified headers and variables
    sendQueryRequest$: Observable<Action> = this.actions$
        .ofType(queryActions.SEND_QUERY_REQUEST, queryActions.CANCEL_QUERY_REQUEST)
        .withLatestFrom(this.store, (action: queryActions.Action, state: fromRoot.State) => {
            return { data: state.windows[action.windowId], windowId: action.windowId, action };
        })
        .switchMap(response => {
            // If the URL is not set or is invalid, just return
            if (!response.data.query.url || !validUrl.isUri(response.data.query.url)) {

                this.notifyService.error('The URL is invalid!');
                this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                return Observable.empty();
            }

            if (response.action.type === queryActions.CANCEL_QUERY_REQUEST) {
                this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                return Observable.empty();
            }

            // Store the current query into the history if it does not already exist in the history
            if (!response.data.history.list.filter(item => item.query.trim() === response.data.query.query.trim()).length) {
              this.store.dispatch(new historyActions.AddHistoryAction(response.windowId, { query: response.data.query.query }));
            }

            // If the query is a subscription, subscribe to the subscription URL and send the query
            if (this.gqlService.isSubscriptionQuery(response.data.query.query)) {
              console.log('Your query is a SUBSCRIPTION!!!');
              // If the subscription URL is not set, show the dialog for the user to set it
              if (!response.data.query.subscriptionUrl) {
                this.store.dispatch(new dialogsActions.ToggleSubscriptionUrlDialogAction(response.windowId));
              } else {
                this.store.dispatch(new queryActions.StartSubscriptionAction(response.windowId));
              }
              return Observable.empty();
            }

            // Check if there are more than one operations in the query
            // If check if there is already a selected operation
            // Check if the selected operation matches any operation, else ask the user to select again
            const operations = this.gqlService.getOperations(response.data.query.query);

            this.store.dispatch(new queryActions.SetQueryOperationsAction(response.windowId, { operations }));

            if (operations && operations.length > 1) {
              if (
                !response.data.query.selectedOperation ||
                operations.map(def => def['name'] && def['name'].value).indexOf(response.data.query.selectedOperation) === -1) {
                // Ask the user to select operation
                this.notifyService.warning(
                  `You have more than one query operations.
                  You need to select the one you want to run from the dropdown.`
                );
                this.store.dispatch(new queryActions.SetSelectedOperationAction(response.windowId, { selectedOperation: '' }));
                return Observable.empty();
              }
            } else {
              // Clear out the selected operation
              this.store.dispatch(new queryActions.SetSelectedOperationAction(response.windowId, { selectedOperation: '' }));
            }

          this.store.dispatch(new layoutActions.StartLoadingAction(response.windowId));
            const requestStartTime = new Date().getTime();
            let requestStatusCode = 0;
            let requestStatusText = '';

            try {
              if (response.data.variables.variables) {
                JSON.parse(response.data.variables.variables);
              }
            } catch (err) {
              this.notifyService.error('Looks like your variables is not a valid JSON string.');
              this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
              return Observable.empty();
            }

            // For electron app, send the instruction to set headers
            this.electronAppService.setHeaders(response.data.headers);

            return this.gqlService
                .setUrl(response.data.query.url)
                .setHeaders(response.data.headers)
                .setHTTPMethod(response.data.query.httpVerb)
                ._send(response.data.query.query, response.data.variables.variables, response.data.query.selectedOperation)
                .map(res => {
                    requestStatusCode = res.status;
                    requestStatusText = res.statusText;
                    return res.body;
                })
                .map(result => {
                    return new queryActions.SetQueryResultAction(result, response.windowId);
                }).catch((error) => {
                    let output = 'Server Error';

                    console.log(error);
                    requestStatusCode = error.status;
                    requestStatusText = error.statusText;

                    if (error.status) {
                        output = error.error;
                    }
                    return Observable.of(new queryActions.SetQueryResultAction(output, response.windowId));
                }).do(() => {
                    const requestEndTime = new Date().getTime();
                    const requestElapsedTime = requestEndTime - requestStartTime;

                    this.store.dispatch(new queryActions.SetResponseStatsAction(response.windowId, {
                        responseStatus: requestStatusCode,
                        responseTime: requestElapsedTime,
                        responseStatusText: requestStatusText
                    }));
                    this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                });
        });

    // TODO: Clean this effect up!
    @Effect()
    // Shows the URL set alert after the URL is set
    showUrlSetAlert$: Observable<queryActions.Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .do((data: queryActions.Action) => {
            // If the URL is not valid
            if (!validUrl.isUri(data.payload.url)) {
                this.notifyService.error('The URL is invalid!');
            } else {
              this.notifyService.success('URL has been set.');
            }

            return data;
        })
        .switchMap((data: queryActions.Action) => {
            return Observable.timer(3000)
                .switchMap(() => Observable.of(new queryActions.HideUrlAlertAction(data.windowId)));
        });

    @Effect()
    // Gets the gql schema after the introspection is set
    getGqlSchema$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_INTROSPECTION, gqlSchemaActions.SET_INTROSPECTION_FROM_DB)
        .switchMap((data: queryActions.Action) => {
            const schema = this.gqlService.getIntrospectionSchema(data.payload);

            if (schema) {
              return Observable.of(new gqlSchemaActions.SetSchemaAction(data.windowId, schema));
            }

            return Observable.empty();
        });

    @Effect()
    saveUrlToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .map((data: queryActions.Action) => {
            this.queryService.storeUrl(data.payload.url, data.windowId);
            return new dbActions.SaveUrlSuccessAction();
        });

    @Effect()
    saveQueryToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_QUERY)
        // Save query after user has stopped typing for 500ms
        .debounce(() => Observable.timer(500))
        .map((data: queryActions.Action) => {
            this.queryService.storeQuery(data.payload, data.windowId);
            return new dbActions.SaveQuerySuccessAction();
        });

    @Effect()
    saveIntrospectionToDb$: Observable<Action> = this.actions$
      .ofType(gqlSchemaActions.SET_INTROSPECTION)
      .map((data: queryActions.Action) => {
        this.queryService.storeIntrospection(data.payload, data.windowId);
        return new dbActions.SaveIntrospectionSuccessAction();
      });

    @Effect()
    getIntrospectionForUrl$: Observable<allActions> = this.actions$
      .ofType(queryActions.SEND_INTROSPECTION_QUERY_REQUEST)
      .withLatestFrom(this.store, (action: queryActions.Action, state) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap((res) => {
        if (!res.data.query.url) {
          return Observable.empty();
        }

        this.store.dispatch(new docsAction.StartLoadingDocsAction(res.windowId));
        return this.gqlService
          .setHeaders(res.data.headers)
          .setHTTPMethod(res.data.query.httpVerb)
          .getIntrospectionRequest(res.data.query.url)
          .catch(err => {
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
              this.notifyService.warning('Seems like something is broken. Please check that the URL is valid.');
            }
            return Observable.of(new docsAction.StopLoadingDocsAction(res.windowId));
          })
          .map(introspectionData => {
            if (!introspectionData) {
                return null;
            }

            this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(true, res.windowId));
            this.store.dispatch(new docsAction.StopLoadingDocsAction(res.windowId));

            return new gqlSchemaActions.SetIntrospectionAction(introspectionData, res.windowId);
          });
      });

    @Effect()
    // Hides the editor set alert after it has been shown
    showEditorSetAlert$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.SHOW_EDITOR_ALERT)
      .switchMap((data: queryActions.Action) => {
        return Observable.timer(3000)
          .switchMap(() => Observable.of(new queryActions.HideEditorAlertAction(data.windowId)));
      });

    @Effect()
    notifyExperimental$: Observable<Action> = this.actions$
      .ofType(layoutActions.NOTIFY_EXPERIMENTAL)
      .switchMap(() => {
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
        return Observable.empty();
      });

    @Effect()
    downloadResult$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.DOWNLOAD_RESULT)
      .withLatestFrom(this.store, (action: queryActions.Action, state) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap(res => {
        downloadJson(res.data.query.response, res.data.layout.title);

        return Observable.empty();
      });

    @Effect()
    startSubscription$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.START_SUBSCRIPTION)
      .withLatestFrom(this.store, (action: queryActions.Action, state) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap(res => {
        try {
          // Stop any currently active subscription
          this.gqlService.closeSubscriptionClient(res.data.query.subscriptionClient);

          const subscriptionClient = this.gqlService.createSubscriptionClient(res.data.query.subscriptionUrl);
          const subClientRequest = subscriptionClient.request({
            query: res.data.query.query,
            variables: JSON.parse(res.data.variables.variables)
          }).subscribe({
            next: data => {
              let strData = '';
              try {
                strData = JSON.stringify(data);
              } catch (err) {
                console.error('Invalid subscription response format.');
                return false;
              }

              this.store.dispatch(new queryActions.AddSubscriptionResponseAction(res.windowId, {
                response: strData,
                responseTime: (new Date()).getTime() // store responseTime in ms
              }));

              // TODO: Consider moving this functionality into the notify service
              // Send notification in electron app
              this.notifyService.pushNotify(strData, res.data.layout.title, {
                onclick: () => {
                  this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId: res.windowId }));
                }
              });

              console.log(data);
            },
            error: err => {
              // Stop the subscription if this happens.
              console.log('Err', err);
            },
            complete: () => {
              // Not yet sure what needs to be done here.
              console.log('Subscription complete.');
            }
          });
          return Observable.of(new queryActions.SetSubscriptionClientAction(res.windowId, { subscriptionClient }));
        } catch (err) {
          console.error('An error occurred starting the subscription.', err);
        }
        return Observable.empty();
      });

    @Effect()
    stopSubscription$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.STOP_SUBSCRIPTION)
      .withLatestFrom(this.store, (action: queryActions.Action, state) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap(res => {
        this.gqlService.closeSubscriptionClient(res.data.query.subscriptionClient);
        return Observable.of(new queryActions.SetSubscriptionClientAction(res.windowId, { subscriptionClient: null }));
      });

    @Effect()
    prettifyQuery$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.PRETTIFY_QUERY)
      .withLatestFrom(this.store, (action: queryActions.Action, state) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap(res => {
        let prettified = '';
        try {
          prettified = this.gqlService.prettify(res.data.query.query);
        } catch (err) {
          console.log(err);
          this.notifyService.error('Your query does not appear to be valid. Please check it.');
        }

        if (prettified) {
          return Observable.of(new queryActions.SetQueryAction(prettified, res.windowId));
        }
        return Observable.empty();
      });

    @Effect()
    compressQuery$: Observable<queryActions.Action> = this.actions$
      .ofType(queryActions.COMPRESS_QUERY)
      .withLatestFrom(this.store, (action: queryActions.Action, state) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap(res => {
        let compressed = '';
        try {
          console.log('We compress..');
          compressed = this.gqlService.compress(res.data.query.query);
          console.log('Compressed..');
        } catch (err) {
          console.log(err);
          this.notifyService.error('Your query does not appear to be valid. Please check it.');
        }

        if (compressed) {
          return Observable.of(new queryActions.SetQueryAction(compressed, res.windowId));
        }
        return Observable.empty();
      });

    @Effect()
    exportSDL$: Observable<Action> = this.actions$
      .ofType(gqlSchemaActions.EXPORT_SDL)
      .withLatestFrom(this.store, (action: gqlSchemaActions.Action, state: fromRoot.State) => {
        return { data: state.windows[action.windowId], windowId: action.windowId, action };
      })
      .switchMap(res => {

        if (res.data.schema.schema) {
          const sdl = this.gqlService.getSDL(res.data.schema.schema);

          if (sdl) {
            downloadData(sdl, 'sdl', { fileType: 'gql' });
          }
        }
        return Observable.empty();
      });

    @Effect()
    showDonationAlert$: Observable<Action> = this.actions$
      .ofType(queryActions.SEND_QUERY_REQUEST)
      .switchMap((data: queryActions.Action) => {
        this.donationService.trackAndCheckIfEligible().subscribe(shouldShow => {
          if (shouldShow) {
            this.store.dispatch(new donationAction.ShowDonationAlertAction());
          }
        });
        return Observable.empty();
      });

    // Get the introspection after setting the URL
    constructor(
      private actions$: Actions,
      private gqlService: GqlService,
      private queryService: QueryService,
      private notifyService: NotifyService,
      private dbService: DbService,
      private donationService: DonationService,
      private electronAppService: ElectronAppService,
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
