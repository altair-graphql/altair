import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as validUrl from 'valid-url';

import { GqlService } from '../services/gql.service';
import { QueryService } from '../services/query.service';
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
        .withLatestFrom(this.store, (action, state) => {
            return { data: state.windows[action.windowId], windowId: action.windowId, action };
        })
        .do((response) => {
            this.store.dispatch(new layoutActions.StartLoadingAction(response.windowId));
        })
        .switchMap(response => {
            // If the URL is not set or is invalid, just return
            if (!response.data.query.url || !validUrl.isUri(response.data.query.url)) {

                const opts = {
                    message: 'The URL is invalid!',
                    success: false
                };

                this.store.dispatch(new queryActions.ShowUrlAlertAction(opts, response.windowId));
                this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                return Observable.empty();
            }

            if (response.action.type === queryActions.CANCEL_QUERY_REQUEST) {
                this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                return Observable.empty();
            }

            const requestStartTime = new Date().getTime();
            let requestStatusCode = 0;

            return this.gqlService
                .setUrl(response.data.query.url)
                .setHeaders(response.data.headers)
                ._send(response.data.query.query, response.data.variables.variables)
                .map(res => {
                    requestStatusCode = res.status;
                    return res.json();
                })
                .map(result => {
                    return new queryActions.SetQueryResultAction(result, response.windowId);
                }).catch((error) => {
                    let output = 'Server Error';

                    requestStatusCode = error.status;

                    if (error.status) {
                        output = error.json() || error.toString();
                    }
                    return Observable.of(new queryActions.SetQueryResultAction(output, response.windowId));
                }).do(() => {
                    const requestEndTime = new Date().getTime();
                    const requestElapsedTime = requestEndTime - requestStartTime;

                    this.store.dispatch(new queryActions.SetResponseStatsAction(response.windowId, {
                        responseStatus: requestStatusCode,
                        responseTime: requestElapsedTime
                    }));
                    this.store.dispatch(new layoutActions.StopLoadingAction(response.windowId));
                });
        });

    @Effect()
    // Shows the URL set alert after the URL is set
    showUrlSetAlert$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .do((data) => {
            const opts = {
                message: 'URL has been set',
                success: true
            };
            // If the URL is not valid
            if (!validUrl.isUri(data.payload)) {
                opts.message = 'The URL is invalid!';
                opts.success = false;
            }
            this.store.dispatch(new queryActions.ShowUrlAlertAction(opts, data.windowId));

            return data;
        })
        .switchMap((data) => {
            return Observable.timer(3000)
                .switchMap(() => Observable.of(new queryActions.HideUrlAlertAction(data.windowId)));
        });

    @Effect()
    // Gets the gql schema after the introspection is set
    getGqlSchema$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_INTROSPECTION, gqlSchemaActions.SET_INTROSPECTION_FROM_DB)
        .switchMap((data) => {
            const schema = this.gqlService.getIntrospectionSchema(data.payload);

            if (schema) {
                return Observable.of(new gqlSchemaActions.SetSchemaAction(schema, data.windowId));
            }

            return Observable.empty();
        });

    @Effect()
    saveUrlToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .map((data) => {
            this.queryService.storeUrl(data.payload, data.windowId);
            return new dbActions.SaveUrlSuccessAction();
        });

    @Effect()
    saveQueryToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_QUERY)
        // Save query after user has stopped typing for 500ms
        .debounce(() => Observable.timer(500))
        .map(data => {
            this.queryService.storeQuery(data.payload, data.windowId);
            return new dbActions.SaveQuerySuccessAction();
        });

    @Effect()
    saveIntrospectionToDb$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_INTROSPECTION)
        .map(data => {
            this.queryService.storeIntrospection(data.payload, data.windowId);
            return new dbActions.SaveIntrospectionSuccessAction();
        });

    @Effect()
    getIntrospectionForUrl$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .switchMap(data => {
            if (!data.payload) {
                return Observable.empty();
            }

            return this.gqlService.getIntrospectionRequest(data.payload)
                .catch(err => {
                    const errorObj = err.json();
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
                        this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(false, data.windowId));
                    }
                    return Observable.empty();
                })
                .map(introspectionData => {
                    if (!introspectionData) {
                        return {};
                    }

                    this.store.dispatch(new gqlSchemaActions.SetAllowIntrospectionAction(true, data.windowId));
                    return new gqlSchemaActions.SetIntrospectionAction(introspectionData, data.windowId);
                });
        });

    // Get the introspection after setting the URL
    constructor(
        private actions$: Actions,
        private gqlService: GqlService,
        private queryService: QueryService,
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
