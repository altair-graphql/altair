import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as validUrl from 'valid-url';

import { GqlService, QueryService, NotifyService } from '../services';
import * as fromRoot from '../reducers';

import * as queryActions from '../actions/query/query';
import * as layoutActions from '../actions/layout/layout';
import * as gqlSchemaActions from '../actions/gql-schema/gql-schema';
import * as dbActions from '../actions/db/db';

@Injectable()
export class QueryEffects {

    @Effect()
    // Sends the query request to the specified URL
    // with the specified headers and variables
    sendQueryRequest$: Observable<Action> = this.actions$
        .ofType(queryActions.SEND_QUERY_REQUEST, queryActions.CANCEL_QUERY_REQUEST)
        .withLatestFrom(this.store, (action: queryActions.Action, state) => {
            return { data: state.windows[action.windowId], windowId: action.windowId, action };
        })
        .do((response) => {
            this.store.dispatch(new layoutActions.StartLoadingAction(response.windowId));
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

            const requestStartTime = new Date().getTime();
            let requestStatusCode = 0;
            let requestStatusText = '';

            return this.gqlService
                .setUrl(response.data.query.url)
                .setHeaders(response.data.headers)
                ._send(response.data.query.query, response.data.variables.variables)
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
            if (!validUrl.isUri(data.payload)) {
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
                return Observable.of(new gqlSchemaActions.SetSchemaAction(schema, data.windowId));
            }

            return Observable.empty();
        });

    @Effect()
    saveUrlToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .map((data: queryActions.Action) => {
            this.queryService.storeUrl(data.payload, data.windowId);
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
    getIntrospectionForUrl$: Observable<queryActions.Action> = this.actions$
        .ofType(queryActions.SEND_INTROSPECTION_QUERY_REQUEST)
        .withLatestFrom(this.store, (action: queryActions.Action, state) => {
            return { data: state.windows[action.windowId], windowId: action.windowId, action };
        })
        .switchMap((res) => {
            if (!res.data.query.url) {
                return Observable.empty();
            }

            return this.gqlService.getIntrospectionRequest(res.data.query.url)
                .catch(err => {
                    const errorObj = err;
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
                    }
                    return Observable.empty();
                })
                .map(introspectionData => {
                    if (!introspectionData) {
                        return Observable.empty();
                    }

                    this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(true, res.windowId));
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

    // Get the introspection after setting the URL
    constructor(
        private actions$: Actions,
        private gqlService: GqlService,
        private queryService: QueryService,
        private notifyService: NotifyService,
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
