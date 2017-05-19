import { Component } from '@angular/core';
import { Store } from './store';
import { StoreHelper } from './services/store-helper';

import { GqlService } from './services/gql.service';
import { graphql } from 'graphql';

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
  showHeaderDialog = false;
  showVariableDialog = false;
  showResult = false;
  headers = [];
  variables = [];
  introspectionResult = {};
  gqlSchema = null;

  showUrlAlert = false;

  isLoading = false;

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
        this.gql.setHeaders(data.headers);
        this.showHeaderDialog = data.showHeaderDialog;
        this.showResult = data.showResult;
        this.introspectionResult = data.introspectionResult;
        this.gqlSchema = data.gqlSchema;
        this.variables = data.variables;
      });

    this.storeHelper.update('apiUrl', this.gql.getUrl());
    this.storeHelper.update('query', this.initialQuery);
  }

  setApiUrl($event) {
    this.gql.setUrl(this.apiUrl);
    this.showUrlAlert = true;
    setTimeout(() => {
      this.showUrlAlert = false;
    }, 3000);
  }

  sendRequest() {
    this.isLoading = true;
    this.gql.send(this.query, this.getVariablesObj())
      .subscribe(data => {
        this.isLoading = false;
        this.storeHelper.update('queryResult', data);
      },
        error => {
          this.isLoading = false;
          const _output = error._body || error.json().error || 'Server Error';
          this.storeHelper.update('queryResult', _output);
        }
      );
  }

  getVariablesObj() {
    const vars = {};

    this.variables.forEach(v => {
      if (v.key && v.value) {
        vars[v.key] = JSON.parse(v.value);
      }
    });

    return vars;
  }

  updateQuery(query) {
    this.storeHelper.update('query', query);
    localStorage.setItem('altair:query', query);
  }

  toggleHeader() {
    this.storeHelper.update('showHeaderDialog', !this.showHeaderDialog);
  }

  toggleVariableDialog() {
    this.showVariableDialog = !this.showVariableDialog;
  }

  toggleResult() {
    this.storeHelper.update('showResult', !this.showResult);
  }

  addHeader() {
    this.headers.push({
      key: '',
      value: ''
    });
    this.storeHelper.update('headers', this.headers);
  }

  headerKeyChange($event, i) {
    const val = $event.target.value;
    this.headers[i].key = val;
    this.storeHelper.update('headers', this.headers);
  }
  headerValueChange($event, i) {
    const val = $event.target.value;
    this.headers[i].value = val;
    this.storeHelper.update('headers', this.headers);
  }

  removeHeader(i) {
    this.headers.splice(i , 1);
    this.storeHelper.update('headers', this.headers);
  }
}
