import { Component } from '@angular/core';

import { GqlService } from './services/gql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app works!';
  apiUrl = '';
  query = '{menu(platform:"kongax"){menuItems{label,position,icon{type,source},color,link{type,to},children{label,position,icon{type,source},color,link{type,to},children{label,position,icon{type,source},color,link{type,to},children{label,position,icon{type,source},color,link{type,to},children{label,position,icon{type,source},color,link{type,to}}}}}}}}';
  queryResult = '';

  constructor(private gql: GqlService){}

  setApiUrl($event) {
    this.apiUrl = $event.target.value;
    // this.gql.setUrl($event.target.value);
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
  }
}
