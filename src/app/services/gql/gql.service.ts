
import {throwError as observableThrowError, Observable } from 'rxjs';

import {map, catchError, tap} from 'rxjs/operators';
import { HttpHeaders, HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as prettier from 'prettier/standalone';
import * as prettierGraphql from 'prettier/parser-graphql';


import { SubscriptionClient, ClientOptions as SubscriptionClientOptions } from 'subscriptions-transport-ws';
// TODO: Use `getIntrospectionQuery` instead of `introspectionQuery` when there is typings for it
import { buildClientSchema, parse, print, GraphQLSchema, printSchema, getIntrospectionQuery, validateSchema, visit } from 'graphql';
import * as compress from 'graphql-query-compress'; // Somehow this is the way to use this

import { NotifyService } from '../notify/notify.service';

import { oldIntrospectionQuery } from './oldIntrospectionQuery';
import { buildClientSchema as oldBuildClientSchema } from './oldBuildClientSchema';
import { debug } from 'app/utils/logger';

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
    private http: HttpClient,
    private notifyService: NotifyService
  ) {

    // Set the default headers on initialization
    this.setHeaders();
  }

  private checkForError(res: HttpResponse<any>): HttpResponse<any> {
    // debug.log(res);
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
  _send(query, vars?, selectedOperation?) {
    const data: any = { query, variables: {} };

    if (selectedOperation) {
      data.operationName = selectedOperation;
    }

    // If there is a variables option, add it to the data
    if (vars) {
      try {
        data.variables = JSON.parse(vars);
      } catch (err) {
        // Notify the user about badly written variables.
        console.error(err);
        return observableThrowError(err);
      }
    }
    return this.http.request(this.method, this.api_url, {
      // GET method uses params, while the other methods use body
      body: this.method.toLowerCase() !== 'get' ? JSON.stringify(data) : null,
      params: this.method.toLowerCase() !== 'get' ? null : this.getParamsFromData(data),
      headers: this.headers,
      observe: 'response'
    })
    .pipe(
      map(this.checkForError),
      catchError(err => {
        console.error(err);
        return observableThrowError(err);
      }),
    );
  }

  /**
   * Send graphQL request and return the response
   * @param query
   * @param vars
   */
  send(query, vars?, selectedOperation?) {
    return this._send(query, vars, selectedOperation).pipe(map(res => res.body));
  }

  setHeaders(headers?) {
    let newHeaders = new HttpHeaders(this.defaultHeaders);

    const forbiddenHeaders = [ 'Origin' ];

    if (headers) {
      headers.forEach(header => {
        if (!forbiddenHeaders.includes(header.key) && header.key && header.value) {
          newHeaders = newHeaders.set(header.key, header.value);
        }
      });
    }

    this.headers = newHeaders;
    return this;
  }

  getParamsFromData(data) {
    return Object.keys(data)
      .reduce(
        (params, key) => params.set(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]),
        new HttpParams()
      );
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
    return this.send(getIntrospectionQuery()).pipe(
      map(data => {
        debug.log('introspection', data.data);
        return data.data;
      }),
      catchError((err) => {
        debug.log('Error from first introspection query.', err);

        // Try the old introspection query
        return this.send(oldIntrospectionQuery).pipe(map(data => {
          debug.log('old introspection', data.data);
          return data.data;
        }));
      }),
      tap(() => this.api_url = currentApiUrl),
    );
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
      debug.log('Trying old buildClientSchema.', err);
      try {
        const schema = oldBuildClientSchema(data);

        this.notifyService.info(`
          Looks like your server is still using an old version of GraphQL (older than v0.5.0).
          You should upgrade to avoid broken implementations.
        `);
        return schema;
      } catch (err) {
        debug.log('Bad introspection data.', err);
        this.notifyService
          .error(`
            Looks like the GraphQL schema is invalid.
            Please check that your schema in your GraphQL server conforms to the latest GraphQL spec.
          `);
      }

      return null;
    }
  }

  parseQuery(query: string) {
    if (!query) {
      return {};
    }
    try {
      return parse(query);
    } catch (err) {
      console.error('Something wrong with your query', err);

      return {};
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

    const parsedQuery = this.parseQuery(query);

    if (!parsedQuery.definitions) {
      return false;
    }

    return parsedQuery.definitions.reduce((acc, cur) => {
      return acc || (cur.kind === 'OperationDefinition' && cur.operation === 'subscription');
    }, false);
  }

  createSubscriptionClient(subscriptionUrl, opts?: SubscriptionClientOptions): SubscriptionClient {
    return new SubscriptionClient(subscriptionUrl, {
      reconnect: true,
      ...opts
    });
  }

  closeSubscriptionClient(subscriptionClient) {
    if (subscriptionClient) {

      if (subscriptionClient.close) {
        subscriptionClient.close();
      }
    }
  }

  getOperations(query: string) {
    const parsedQuery = this.parseQuery(query);

    if (parsedQuery.definitions) {
      return parsedQuery.definitions
        .filter(def => def.kind === 'OperationDefinition')
        .map((def, i) => {
          // Make sure all operations have names
          if (!def['name'] || !def['name'].value) {
            def['name'] = def['name'] || {};
            def['name'].value = '#' + i.toString();
          }
          return def;
        });
    }

    return [];
  }

  /**
   * Prettifies (formats) a given query
   * @param query
   */
  prettify(query: string) {
    // return print(parse(query));
    return prettier.format(query, { parser: 'graphql', plugins: [ prettierGraphql ] });
  }

  /**
   * Compresses a given query
   * @param query
   */
  compress(query: string) {
    return compress(this.prettify(query));
  }

  /**
   * Gives a name to an anonymous query
   */
  nameQuery(query: string) {
    if (!query) {
      return;
    }
    const ast = this.parseQuery(query);
    const constructedName = query.trim().replace(/[^A-Za-z0-9]/g, '_').replace(/_+/g, '_').substr(0, 20) + (Math.random() * 10).toFixed(0);
    const edited = visit(ast, {
      OperationDefinition(node) {
        debug.log(node);
        const NameKind = node.name || {
          kind: 'Name',
          value: constructedName
        };
        return {
          ...node,
          name: NameKind,
        };
      }
    })

    return print(edited);
  }

  /**
   * Return the Schema Definition Language of the provided schema
   * @param schema
   */
  getSDL(schema): string {
    if (this.isSchema(schema)) {
      return this.prettify(printSchema(schema));
    }
    return '';
  }

  validateSchema(schema) {
    return validateSchema(schema);
  }
}
