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

import { QueryService } from '../../services/query.service';
import { GqlService } from '../../services/gql.service';
import { graphql } from 'graphql';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private queryService: QueryService,
    private gql: GqlService,
    private store: Store<fromRoot.State>
  ) {

    // this.apiUrl$ = this.store.select(fromRoot.getUrl);
    this.store
      .subscribe(data => {
        // this.apiUrl = data.query.url;
        // this.query = data.query.query;
        // this.queryResult = data.query.response;
        // this.headers = data.headers;
        // this.showHeaderDialog = data.dialogs.showHeaderDialog;
        // this.showVariableDialog = data.dialogs.showVariableDialog;
        // this.introspectionResult = data.schema.introspection;
        // this.gqlSchema = data.schema.schema;
        // this.variables = data.variables;
        // this.showDocs = data.docs.showDocs;
        // this.isLoading = data.layout.isLoading;
        // this.showUrlAlert = data.query.showUrlAlert;
        // this.urlAlertMessage = data.query.urlAlertMessage;
        // this.urlAlertSuccess = data.query.urlAlertSuccess;
        // this.allowIntrospection = data.schema.allowIntrospection;
        // console.log(data.query);
      });

    // this.queryService.loadQuery();
    // this.queryService.loadUrl();
    // this.queryService.loadIntrospection();
  }

  trackByFn(index, item) {
    return index;
  }
}
