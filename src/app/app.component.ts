import { Component } from '@angular/core';

import { GqlService } from './services/gql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {
  apiUrl = this.gql.getUrl();
  initialQuery = '';
  query = '';
  queryResult = '';
  isLoading = false;

  constructor(private gql: GqlService) {
    this.initialQuery = localStorage.getItem('altair:query');
    this.query = this.initialQuery;
  }

  setApiUrl($event) {
    this.gql.setUrl(this.apiUrl);
    localStorage.setItem('altair:url', this.apiUrl);
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
    this.query = query;
    localStorage.setItem('altair:query', this.query);
  }
}
