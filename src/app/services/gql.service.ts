import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { SubscriptionClient } from 'subscriptions-transport-ws';
// TODO: Use `getIntrospectionQuery` instead of `introspectionQuery` when there is typings for it
import { buildClientSchema, parse, print, GraphQLSchema, printSchema, introspectionQuery } from 'graphql';
import * as compress from 'graphql-query-compress'; // Somehow this is the way to use this

// Import Rx to get all the operators loaded into the file
import 'rxjs/Rx';
// TODO - Check if this is necessary
import 'rxjs/add/observable/throw';

import { oldIntrospectionQuery } from './oldIntrospectionQuery';

@Injectable()
export class GqlService {
  defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  headers: HttpHeaders;

  private api_url = localStorage.getItem('altair:url');
  private method = 'POST';
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
      try {
        data.variables = JSON.parse(vars);
      } catch (err) {
        // Notify the user about badly written variables.
        console.error(err);
        return Observable.throw(err);
      }
    }
    return this.http.request(this.method, this.api_url, {
      body: JSON.stringify(data),
      headers: this.headers,
      observe: 'response'
    }).map(this.checkForError)
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

  setHTTPMethod(httpVerb) {
    this.method = httpVerb;
    return this;
  }

  getIntrospectionRequest(url): Observable<any> {
    const currentApiUrl = this.api_url;

    this.api_url = url;
    return this.send(introspectionQuery).map(data => {
      console.log('introspection', data.data);
      return data.data;
    })
    .catch((err) => {
      console.log('Error from first introspection query.', err);

      // Try the old introspection query
      return this.send(oldIntrospectionQuery).map(data => {
        console.log('old introspection', data.data);
        return data.data;
      });
    })
    .do(() => this.api_url = currentApiUrl);
  }

  getIntrospectionData() {
    return this.introspectionData;
  }

  getIntrospectionSchema(data) {
    try {
      if (data && data.__schema) {
        const schema = buildClientSchema(data);

        // One type => many fields
        // One field => One type
        return schema;
      }
      return null;
    } catch (err) {
      console.error('Bad introspection data.');
      return null;
    }
  }

  /**
   * Check if the schema is a valid GraphQL schema
   * @param schema The schema object instance
   */
  isSchema(schema) {
    return schema instanceof GraphQLSchema;
  }

  /**
   * Checks if a query contains a subscription operation
   * @param query
   */
  isSubscriptionQuery(query) {
    const parsedQuery = parse(query);

    if (!parsedQuery.definitions) {
      return false;
    }

    return parsedQuery.definitions.reduce((acc, cur) => {
      return acc || (cur.kind === 'OperationDefinition' && cur.operation === 'subscription');
    }, false);
  }

  createSubscriptionClient(subscriptionUrl): SubscriptionClient {
    return new SubscriptionClient(subscriptionUrl, {
      reconnect: true
    });
  }

  closeSubscriptionClient(subscriptionClient) {
    if (subscriptionClient) {

      if (subscriptionClient.close) {
        subscriptionClient.close();
      }
    }
  }

  /**
   * Prettifies (formats) a given query
   * @param query
   */
  prettify(query) {
    return print(parse(query));
  }

  /**
   * Compresses a given query
   * @param query
   */
  compress(query) {
    return compress(this.prettify(query));
  }

  /**
   * Return the Schema Definition Language of the provided schema
   * @param schema
   */
  getSDL(schema): string {
    if (this.isSchema(schema)) {
      return printSchema(schema);
    }
    return '';
  }
}
