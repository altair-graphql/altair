import { Headers, Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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

  headers: Headers;

  private api_url = localStorage.getItem('altair:url');
  introspectionData = {};

  constructor(
    private http: Http
  ) {

    // Set the default headers on initialization
    this.setHeaders();
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

    if (headers) {
      headers.forEach(header => {
        if (header.key && header.value) {
          newHeaders.set(header.key, header.value);
        }
      });
    }

    this.headers = newHeaders;
    return this;
  }

  getUrl() {
    return this.api_url;
  }

  setUrl(url) {
    this.api_url = url;
    return this;
  }

  getIntrospectionRequest(url): Observable<any> {
    const currentApiUrl = this.api_url;

    this.api_url = url;
    return this.send(introspectionQuery).map(data => {
      console.log('introspection', data.data);
      return data.data;
    }).do(() => this.api_url = currentApiUrl);
  }

  getIntrospectionData() {
    return this.introspectionData;
  }

  getIntrospectionSchema(data) {
    if (data) {
      const schema = buildClientSchema(data);
      return schema;
    }
    return null;
  }
}
