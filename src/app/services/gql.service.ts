import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
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

  headers: HttpHeaders;

  private api_url = localStorage.getItem('altair:url');
  introspectionData = {};

  constructor(
    private http: HttpClient
  ) {

    // Set the default headers on initialization
    this.setHeaders();
  }

  private checkForError(res: HttpResponse<any>): HttpResponse<any> {
    // console.log(res);
    if (res.status >= 200 && res.status < 300) {
      return res;
    } else {
      const err = new Error(res.statusText);
      err['response'] = res;
      throw err;
    }
  }

  /**
   * Send request and return the response object
   * @param query
   * @param vars
   */
  _send(query, vars?) {
    const data = { query: query, variables: {} };

    // If there is a variables option, add it to the data
    if (vars) {
      data.variables = JSON.parse(vars);
    }

    return this.http.post(this.api_url, JSON.stringify(data), { headers: this.headers, observe: 'response' })
      .map(this.checkForError)
      .catch(err => {
        console.error(err);
        return Observable.throw(err);
      });
  }

  /**
   * Send graphQL request and return the response
   * @param query
   * @param vars
   */
  send(query, vars?) {
    return this._send(query, vars).map(res => res.body);
  }

  setHeaders(headers?) {
    let newHeaders = new HttpHeaders(this.defaultHeaders);

    if (headers) {
      headers.forEach(header => {
        if (header.key && header.value) {
          newHeaders = newHeaders.set(header.key, header.value);
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
    }).do(() => this.api_url = currentApiUrl).catch(err => {
      return Observable.empty();
    });
  }

  getIntrospectionData() {
    return this.introspectionData;
  }

  getIntrospectionSchema(data) {
    if (data) {
      const schema = buildClientSchema(data);

      // One type => many fields
      // One field => One type
      return schema;
    }
    return null;
  }
}
