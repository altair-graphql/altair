
import {throwError as observableThrowError, Observable } from 'rxjs';

import {map, catchError, tap} from 'rxjs/operators';
import { HttpHeaders, HttpClient, HttpResponse, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as prettier from 'prettier/standalone';
import * as prettierGraphql from 'prettier/parser-graphql';
import getTypeInfo from 'codemirror-graphql/utils/getTypeInfo';


import { SubscriptionClient, ClientOptions as SubscriptionClientOptions } from 'subscriptions-transport-ws';
// TODO: Use `getIntrospectionQuery` instead of `introspectionQuery` when there is typings for it
import {
  buildClientSchema,
  parse,
  print,
  GraphQLSchema,
  printSchema,
  getIntrospectionQuery,
  validateSchema,
  visit
} from 'graphql';
import { getAutocompleteSuggestions } from 'graphql-language-service-interface';
import * as compress from 'graphql-query-compress'; // Somehow this is the way to use this

import { NotifyService } from '../notify/notify.service';

import { oldIntrospectionQuery } from './oldIntrospectionQuery';
import { buildClientSchema as oldBuildClientSchema } from './oldBuildClientSchema';
import { debug } from 'app/utils/logger';

import * as fromHeaders from '../../reducers/headers/headers';
import * as fromVariables from '../../reducers/variables/variables';

interface SendRequestOptions {
  query: string;
  variables: string;
  method: string;
  headers?: fromHeaders.Header[];
  files?: fromVariables.FileVariable[];
  selectedOperation?: string;
};

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
  _send(query, vars?, selectedOperation?, files?: fromVariables.FileVariable[]) {
    const data = { query, variables: {}, operationName: null };
    let body = null;
    let params = null;
    const headers = this.headers;

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

    if (this.method.toLowerCase() !== 'get') {
      if (files && files.length) {
        // https://github.com/jaydenseric/graphql-multipart-request-spec#multipart-form-field-structure
        const fileMap = {};
        data.variables = data.variables || {};
        files.forEach((file, i) => {
          const fileNameParts = file.name.split('.');
          if (fileNameParts[1]) {
            data.variables[fileNameParts[0]] = data.variables[fileNameParts[0]] || [];
            data.variables[fileNameParts[0]] = [ ...data.variables[fileNameParts[0]], null ];
          } else {
            data.variables[file.name] = null;
          }
          fileMap[i] = [ `variables.${file.name}` ];
        });
        const formData = new FormData();
        formData.append('operations', JSON.stringify(data));
        formData.append('map', JSON.stringify(fileMap));
        files.forEach((file, i) => {
          formData.append(`${i}`, file.data);
        });

        body = formData;
      } else {
        body = JSON.stringify(data);
      }
    } else {
      params = this.getParamsFromData(data);
    }
    return this.http.request(this.method, this.api_url, {
      // GET method uses params, while the other methods use body
      body,
      params,
      headers,
      observe: 'response',
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
  send(query, vars?, selectedOperation?, files?) {
    return this._send(query, vars, selectedOperation, files).pipe(map(res => res.body));
  }

  sendRequest(url: string, opts: SendRequestOptions) {
    const files = opts.files && opts.files.length && opts.files.filter(file => file && file.data instanceof File && file.name);

    this.setUrl(url)
      // Skip json default headers for files
      .setHeaders(opts.headers, { skipDefaults: !!(files && files.length) })
      .setHTTPMethod(opts.method);

    return this._send(opts.query, opts.variables, opts.selectedOperation, files);
  }

  setHeaders(headers = [], opts = { skipDefaults: false }) {
    let newHeaders = new HttpHeaders();
    if (!opts.skipDefaults) {
      newHeaders = new HttpHeaders(this.defaultHeaders);
    }

    const forbiddenHeaders = [ 'Origin' ];

    if (headers && headers.length) {
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
    return this._send(getIntrospectionQuery()).pipe(
      map(data => {
        debug.log('introspection', data);
        return data;
      }),
      catchError((err) => {
        debug.log('Error from first introspection query.', err);

        // Try the old introspection query
        return this._send(oldIntrospectionQuery).pipe(map(data => {
          debug.log('old introspection', data);
          return data;
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

  getActualTypeName(type) {
    if (type) {
      return type.inspect().replace(/[\[\]!]/g, '');
    }
    return '';
  }

  fillAllFields(schema, query, cursor, token) {
    const typeInfo = getTypeInfo(schema, token.state);
    const typeName = this.getActualTypeName(typeInfo.type);
    const graphqlType = schema.getType(typeName);
    const edited = visit(this.parseQuery(query), {
      Field: {
        enter(node) {
          if (
            node.name.value === token.state.name &&
            // AST line number is 1-indexed while codemirror cursor line number is 0-indexed.
            node.loc.startToken.line - 1 === cursor.line &&
            typeInfo.type && graphqlType.getFields
          ) {
            const fields = graphqlType.getFields();
            debug.log(node, typeInfo, fields, cursor, token);
            return {
              ...node,
              selectionSet: {
                kind: 'SelectionSet',
                selections: Object.keys(fields).map(field => {
                  return {
                    kind: 'Field',
                    name: {
                      kind: 'Name',
                      value: field
                    }
                  };
                })
              }
            };
          }
        },
        leave(node) {
          debug.log(node);
        }
      }
    });

    return print(edited);
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

  getOperations(query: string): any[] {
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

  getOperationAtIndex(query: string, index: number) {
    return this.getOperations(query).find(operation => {
      return operation.loc.start <= index && operation.loc.end >= index;
    });
  }

  getOperationNameAtIndex(query: string, index: number): string {
    const operation = this.getOperationAtIndex(query, index);

    if (operation) {
      return operation.name && operation.name.value;
    }
    return '';
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
    });

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

  createStreamClient(streamUrl): EventSource {
    const eventSource = new EventSource(streamUrl);
    return eventSource;
  }

  closeStreamClient(streamClient: EventSource) {
    if (streamClient) {

      if (streamClient.close) {
        streamClient.close();
      }
    }
  }
}
