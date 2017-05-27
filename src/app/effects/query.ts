import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

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
        .ofType(queryActions.SEND_QUERY_REQUEST)
        .withLatestFrom(this.store, (action, state) => {
            return state;
        })
        .do(() => {
            this.store.dispatch(new layoutActions.StartLoadingAction());
        })
        .switchMap(data => {

            return this.gqlService
                .setUrl(data.query.url)
                .setHeaders(data.headers)
                .send(data.query.query, this.getVariablesObj(data.variables))
                .map(result => {
                    return new queryActions.SetQueryResultAction(result);
                }).catch((error) => {
                    let output = 'Server Error';
                    if (error.status) {
                        output = error.json() || error.toString();
                    }
                    return Observable.of(new queryActions.SetQueryResultAction(output));
                }).do(() => {
                    this.store.dispatch(new layoutActions.StopLoadingAction());
                });
        });

    @Effect()
    // Shows the URL set alert after the URL is set
    showUrlSetAlert$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .do(() => {
            this.store.dispatch(new queryActions.ShowUrlAlertAction());
        })
        .switchMap(() => {
            return Observable.timer(3000)
                .switchMap(() => Observable.of(new queryActions.HideUrlAlertAction()));
        });

    @Effect()
    // Gets the gql schema after the introspection is set
    getGqlSchema$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_INTROSPECTION, gqlSchemaActions.SET_INTROSPECTION_FROM_DB)
        .map(toPayload)
        .switchMap((data) => {
            const schema = this.gqlService.getIntrospectionSchema(data);

            if (schema) {
                return Observable.of(new gqlSchemaActions.SetSchemaAction(schema));
            }

            return Observable.empty();
        });

    @Effect()
    saveUrlToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .map(toPayload)
        .map((data) => {
            this.queryService.storeUrl(data);
            return new dbActions.SaveUrlSuccessAction();
        });

    @Effect()
    saveQueryToDb$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_QUERY)
        .map(toPayload)
        .map(data => {
            this.queryService.storeQuery(data);
            return new dbActions.SaveQuerySuccessAction();
        });

    @Effect()
    saveIntrospectionToDb$: Observable<Action> = this.actions$
        .ofType(gqlSchemaActions.SET_INTROSPECTION)
        .map(toPayload)
        .map(data => {
            this.queryService.storeIntrospection(data);
            return new dbActions.SaveIntrospectionSuccessAction();
        });

    @Effect()
    getIntrospectionForUrl$: Observable<Action> = this.actions$
        .ofType(queryActions.SET_URL)
        .map(toPayload)
        .switchMap(url => {
            if (!url) {
                return Observable.empty();
            }

            return this.gqlService.getIntrospectionRequest(url)
                .catch(err => {
                    return Observable.empty();
                })
                .map(introspectionData => {
                    if (!introspectionData) {
                        return {};
                    }

                    return new gqlSchemaActions.SetIntrospectionAction(introspectionData);
                });
        });

    // Get the introspection after setting the URL
    constructor(
        private actions$: Actions,
        private gqlService: GqlService,
        private queryService: QueryService,
        private store: Store<fromRoot.State>
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
