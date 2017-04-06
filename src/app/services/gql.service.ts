import { Headers, Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store } from '../store';
import { StoreHelper } from './store-helper';

import { buildClientSchema } from 'graphql';
import { introspectionQuery } from './instrospectionQuery';

// Import Rx to get all the operators loaded into the file
import 'rxjs/Rx';
// TODO - Check if this is necessary
import 'rxjs/add/observable/throw';

@Injectable()
export class GqlService {
  defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  headers: Headers = this.setHeaders();

  private api_url = localStorage.getItem('altair:url');
  introspectionData = JSON.parse(localStorage.getItem('altair:introspection'));

  constructor(
    private http: Http,
    private storeHelper: StoreHelper
  ) {
    this.storeHelper.update('introspectionResult', this.introspectionData);
    this.getIntrospectionSchema(this.introspectionData);
  }

  private getJson(res: Response) {
      return res.json();
  }

  private checkForError(res: Response): Response {
    if (res.status >= 200 && res.status < 300) {
      return res;
    } else {
      const err = new Error(res.statusText);
      err['response'] = res;
      console.error(err);
      throw err;
    }
  }
  get(path: string): Observable<any> {
    return this.http.get(`${this.api_url}${path}`, { headers: this.headers })
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  post(path: string, body): Observable<any> {
    return this.http.post(`${this.api_url}${path}`, JSON.stringify(body), { headers: this.headers })
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${this.api_url}${path}`, { headers: this.headers })
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  send(query, vars?) {
    const data = { query: query, variables: {} };

    // If there is a variables option, add it to the data
    if (vars) {
      data.variables = vars;
    }

    return this.http.post(this.api_url, JSON.stringify(data), { headers: this.headers })
      .map(this.checkForError)
      .catch(err => {
        console.error(err);
        return Observable.throw(err);
      })
      .map(this.getJson);
  }

  setHeaders(headers?) {
    const newHeaders = new Headers(this.defaultHeaders);

    if(headers){
      headers.forEach(header => {
        if (header.key && header.value) {
          newHeaders.set(header.key, header.value);
        }
      });
    }

    this.headers = newHeaders;
    return newHeaders;
  }

  getUrl() {
    return this.api_url;
  }

  setUrl(url) {
    this.api_url = url;
    localStorage.setItem('altair:url', this.api_url);
    if(this.api_url){
      this.getIntrospectionRequest();
    }
  }

  getIntrospectionRequest() {
    this.send(introspectionQuery).subscribe(data => {
      console.log('introspection', data.data);
      this.storeHelper.update('introspectionResult', data.data);
      localStorage.setItem('altair:introspection', JSON.stringify(data.data));
      this.getIntrospectionSchema(data.data);
    });
  }

  getIntrospectionData() {
    return this.introspectionData;
  }

  getIntrospectionSchema(data) {
    if (data) {
      const schema = buildClientSchema(data);
      this.storeHelper.update('gqlSchema', schema);
      return schema;
    }
    return null;
  }
}
