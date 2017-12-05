import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as fromRoot from '../reducers';

import * as queryActions from '../actions/query/query';
import * as gqlSchemaActions from '../actions/gql-schema/gql-schema';

import { DbService } from '../services/db.service';

@Injectable()
export class QueryService {

  constructor(
    private db: DbService,
    private store: Store<fromRoot.State>
  ) { }

  loadUrl(windowId): Subscription {
    return this.db.getItem(`${windowId}:url`).subscribe(url => {
      if (url) {
        this.store.dispatch(new queryActions.SetUrlFromDbAction({ url }, windowId));
      }
    });
  }

  loadQuery(windowId): Subscription {
    return this.db.getItem(`${windowId}:query`).subscribe(query => {
      if (query) {
        this.store.dispatch(new queryActions.SetQueryFromDbAction(query, windowId));
      }
    });
  }

  loadIntrospection(windowId): Subscription {
    return this.db.getItem(`${windowId}:introspection`).subscribe(introspectionData => {
      if (introspectionData) {
        this.store.dispatch(new gqlSchemaActions.SetIntrospectionFromDbAction(introspectionData, windowId));
      }
    });
  }

  storeUrl(url, windowId): Observable<any> {
    return this.db.setItem(`${windowId}:url`, url);
  }

  storeQuery(query, windowId): Observable<any> {
    return this.db.setItem(`${windowId}:query`, query);
  }

  storeIntrospection(introspection, windowId): Observable<any> {
    return this.db.setItem(`${windowId}:introspection`, introspection);
  }
}
