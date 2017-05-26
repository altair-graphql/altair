import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as fromHeader from '../../reducers/headers/headers';
import * as fromVariable from '../../reducers/variables/variables';

import * as queryActions from '../../actions/query/query';
import * as headerActions from '../../actions/headers/headers';
import * as variableActions from '../../actions/variables/variables';
import * as dialogsActions from '../../actions/dialogs/dialogs';
import * as docsActions from '../../actions/docs/docs';

// import { Store } from '../../store';
import { StoreHelper } from '../../services/store-helper';

import { QueryService } from '../../services/query.service';
import { GqlService } from '../../services/gql.service';
import { graphql } from 'graphql';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {
  apiUrl$;

  @ViewChild('urlInput') urlInput;

  apiUrl = '';
  initialQuery = '';
  query = '';
  queryResult = '';
  showHeaderDialog = false;
  showVariableDialog = false;
  showDocs = true;
  headers: fromHeader.State = [];
  variables: fromVariable.State = [];
  introspectionResult = {};
  gqlSchema = null;

  showUrlAlert = false;

  isLoading = false;

  constructor(
    private queryService: QueryService,
    private gql: GqlService,
    private store: Store<fromRoot.State>,
    private storeHelper: StoreHelper
  ) {
    // this.initialQuery = localStorage.getItem('altair:query');

    // this.apiUrl$ = this.store.select(fromRoot.getUrl);
    this.store
      .subscribe(data => {
        this.apiUrl = data.query.url;
        this.query = data.query.query;
        this.queryResult = data.query.response;
        this.headers = data.headers;
        // this.gql.setHeaders(data.headers);
        this.showHeaderDialog = data.dialogs.showHeaderDialog;
        this.showVariableDialog = data.dialogs.showVariableDialog;
        // this.showResult = data.showResult;
        this.introspectionResult = data.schema.introspection;
        this.gqlSchema = data.schema.schema;
        this.variables = data.variables;
        this.showDocs = data.docs.showDocs;
        // console.log(data.query);
      });

    this.queryService.loadQuery();
    this.queryService.loadUrl();
  }

  setApiUrl() {
    const newUrl = this.urlInput.nativeElement.value;
    this.store.dispatch(new queryActions.SetUrlAction(newUrl));
    // this.gql.setUrl(this.apiUrl);
    // this.showUrlAlert = true;
    // setTimeout(() => {
    //   this.showUrlAlert = false;
    // }, 3000);
  }

  sendRequest() {
    this.store.dispatch(new queryActions.SendQueryRequestAction());
    // this.isLoading = true;
    // this.gql.send(this.query, this.getVariablesObj())
    //   .subscribe(data => {
    //     this.isLoading = false;
    //     this.storeHelper.update('queryResult', data);
    //   },
    //     error => {
    //       this.isLoading = false;
    //       const _output = error.json().error || error.toString() || 'Server Error';
    //       this.storeHelper.update('queryResult', _output);
    //     }
    //   );
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
    this.store.dispatch(new queryActions.SetQueryAction(query));
  }

  toggleHeader() {
    this.store.dispatch(new dialogsActions.ToggleHeaderDialogAction());
  }

  toggleVariableDialog() {
    this.store.dispatch(new dialogsActions.ToggleVariableDialogAction());
  }

  toggleDocs() {
    this.store.dispatch(new docsActions.ToggleDocsViewAction());
  }

  addHeader() {
    this.store.dispatch(new headerActions.AddHeaderAction());
  }

  headerKeyChange($event, i) {
    const val = $event.target.value;
    this.store.dispatch(new headerActions.EditHeaderKeyAction({ val, i }));
  }
  headerValueChange($event, i) {
    const val = $event.target.value;
    this.store.dispatch(new headerActions.EditHeaderValueAction({ val, i }));
  }

  removeHeader(i) {
    this.store.dispatch(new headerActions.RemoveHeaderAction(i));
  }

  addVariable() {
    this.store.dispatch(new variableActions.AddVariableAction());
  }
  updateVariableKey(event) {
    const {val, i} = event;
    this.store.dispatch(new variableActions.EditVariableKeyAction({ val, i }));
  }
  updateVariableValue(event) {
    const {val, i} = event;
    this.store.dispatch(new variableActions.EditVariableValueAction({ val, i }));
  }
  removeVariable(i) {
    this.store.dispatch(new variableActions.RemoveVariableAction(i));
  }

  prettifyCode() {
    this.store.dispatch(new queryActions.PrettifyQueryAction());
  }

  trackByFn(index, item) {
    return index;
  }
}
