import { Component } from '@angular/core';

import { GqlService } from './services/gql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {
  apiUrl = this.gql.getUrl();
  query = localStorage.getItem('altair:query');
  queryResult = '';

  constructor(private gql: GqlService){}

  setApiUrl($event) {
    this.gql.setUrl(this.apiUrl);
    localStorage.setItem('altair:url', this.apiUrl);
  }
  sendRequest(){
    console.log('Sending request');
    this.gql.send(this.query)
      .subscribe(data => {
        console.log(data);
        this.queryResult = data;
      });
  }
  updateQuery(query){
    console.log('Ok');
    this.query = query;
    localStorage.setItem('altair:query', this.query);
  }
}
