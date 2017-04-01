import { Component } from '@angular/core';
import { Store } from './store';
import { StoreHelper } from './services/store-helper';

import { GqlService } from './services/gql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {
  apiUrl = '';
  initialQuery = '';
  query = '';
  queryResult = '';
  isLoading = false;
  showHeaderDialog = false;
  headers = [];

  constructor(
    private gql: GqlService,
    private store: Store,
    private storeHelper: StoreHelper
  ) {
    this.initialQuery = localStorage.getItem('altair:query');

    this.store.changes
      .subscribe(data => {
        this.apiUrl = data.apiUrl;
        this.query = data.query;
        this.queryResult = data.queryResult;
        this.headers = data.headers;
        this.showHeaderDialog = data.showHeaderDialog;
      });

    this.storeHelper.update('apiUrl', this.gql.getUrl());
    this.storeHelper.update('query', this.initialQuery);
  }

  setApiUrl($event) {
    this.gql.setUrl(this.apiUrl);
  }

  sendRequest() {
    this.isLoading = true;
    this.gql.send(this.query)
      .subscribe(data => {
        this.isLoading = false;
        this.queryResult = data;
      });
  }

  updateQuery(query) {
    this.storeHelper.update('query', query);
    localStorage.setItem('altair:query', query);
  }

  toggleHeader() {
    this.showHeaderDialog = !this.showHeaderDialog;
  }

  addHeader() {
    this.headers.push({
      key: '',
      value: ''
    });
  }
}
