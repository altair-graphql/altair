import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

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

  loadUrl(): Observable<any> {
    return this.db.getItem('url').subscribe(url => {
      if (url) {
        this.store.dispatch(new queryActions.SetUrlFromDbAction(url));
      }
    });
  }

  loadQuery(): Observable<any> {
    return this.db.getItem('query').subscribe(query => {
      if (query) {
        this.store.dispatch(new queryActions.SetQueryFromDbAction(query));
      }
    });
  }

  loadIntrospection(): Observable<any> {
    return this.db.getItem('introspection').subscribe(introspectionData => {
      if (introspectionData) {
        this.store.dispatch(new gqlSchemaActions.SetIntrospectionFromDbAction(introspectionData));
      }
    });
  }

  storeUrl(url): Observable<any> {
    return this.db.setItem('url', url);
  }

  storeQuery(query): Observable<any> {
    return this.db.setItem('query', query);
  }

  storeIntrospection(introspection): Observable<any> {
    return this.db.setItem('introspection', introspection);
  }
}
