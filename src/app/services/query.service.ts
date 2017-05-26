import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../reducers';

import * as queryActions from '../actions/query/query';

import { DbService } from '../services/db.service';

@Injectable()
export class QueryService {

  constructor(
    private db: DbService,
    private store: Store<fromRoot.State>
  ) { }

  loadUrl() {
    return this.db.getItem('url').subscribe(url => {
      if (url) {
        this.store.dispatch(new queryActions.SetUrlAction(url));
      }
    });
  }

  loadQuery() {
    return this.db.getItem('query').subscribe(query => {
      if (query) {
        this.store.dispatch(new queryActions.SetQueryAction(query));
      }
    });
  }
}
