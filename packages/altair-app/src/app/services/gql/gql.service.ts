
import {throwError as observableThrowError, Observable, of } from 'rxjs';

import {map, catchError, tap} from 'rxjs/operators';
import { HttpHeaders, HttpClient, HttpResponse, HttpParams, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

// import * as prettier from 'prettier/standalone';
// import * as prettierGraphql from 'prettier/parser-graphql';
// import getTypeInfo from 'codemirror-graphql/utils/getTypeInfo';


import { SubscriptionClient, ClientOptions as SubscriptionClientOptions } from 'subscriptions-transport-ws';
// TODO: Use `getIntrospectionQuery` instead of `introspectionQuery` when there is typings for it
import {
  buildClientSchema,
  buildSchema,
  parse,
  print,
  GraphQLSchema,
  printSchema,
  getIntrospectionQuery,
  validateSchema,
  visit,
  DocumentNode,
  GraphQLType,
  OperationDefinitionNode,
} from 'graphql';
import compress from 'graphql-query-compress'; // Somehow this is the way to use this

import { NotifyService } from '../notify/notify.service';

import { oldIntrospectionQuery } from './oldIntrospectionQuery';
import { buildClientSchema as oldBuildClientSchema } from './oldBuildClientSchema';
import { debug } from 'app/utils/logger';

import * as fromHeaders from '../../reducers/headers/headers';
import * as fromVariables from '../../reducers/variables/variables';
import { fillAllFields } from './fillFields';
import { setByDotNotation } from 'app/utils';
import { Token } from 'codemirror';
import { IDictionary, Omit } from 'app/interfaces/shared';
import {
  refactorFieldsWithFragmentSpread,
  generateTypeUsageEntries,
  generateFragmentRefactorMap,
  addFragmentDefinitionFromRefactorMap,
  refactorArgumentsToVariables,
  generateRandomNameForString,
} from './helpers';
import { SelectedOperation } from 'app/reducers/query/query';


interface SendRequestOptions {
  query: string;
  method: string;
  withCredentials?: boolean;
  variables?: string;
  headers?: fromHeaders.Header[];
  files?: fromVariables.FileVariable[];
  selectedOperation?: SelectedOperation;
};

type IntrospectionRequestOptions = Omit<SendRequestOptions, 'query'>;

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
      const err: any = new Error(res.statusText);
      err['response'] = res;
      throw err;
    }
  }

  /**
   * Send request and return the response object
   * @param query
   * @param vars
   */
  private _send({
    query,
    variables,
    selectedOperation,
    files,
    withCredentials,
  }: Omit<SendRequestOptions, 'method'>,
  ) {
    const data = { query, variables: {}, operationName: (null as SelectedOperation) };
    let body: FormData | string | undefined;
    let params: HttpParams | undefined;
    const headers = this.headers;

    if (selectedOperation) {
      data.operationName = selectedOperation;
    }

    // If there is a variables option, add it to the data
    if (variables) {
      try {
        data.variables = JSON.parse(variables);
      } catch (err) {
        // Notify the user about badly written variables.
        debug.error(err);
        return observableThrowError(err);
      }
    }

    if (!this.isGETRequest()) {
      if (files && files.length) {
        // https://github.com/jaydenseric/graphql-multipart-request-spec#multipart-form-field-structure
        const fileMap: any = {};
        data.variables = data.variables || {};
        files.forEach((file, i) => {
          setByDotNotation(data.variables, file.name, null);
          fileMap[i] = [ `variables.${file.name}` ];
        });
        const formData = new FormData();
        formData.append('operations', JSON.stringify(data));
        formData.append('map', JSON.stringify(fileMap));
        files.forEach((file, i) => {
          formData.append(`${i}`, file.data || '');
        });

        body = formData;
      } else {
        body = JSON.stringify(data);
      }
    } else {
      params = this.getParamsFromData(data);
    }
    if (!this.api_url) {
      throw new Error('You need to have a URL for the request!');
    }
    return this.http.request(this.method, this.api_url, {
      // GET method uses params, while the other methods use body
      ...(!this.isGETRequest() && { body }),
      params,
      headers,
      observe: 'response',
      withCredentials,
    })
    .pipe(
      catchError((err: HttpErrorResponse) => {
        debug.error(err);
        if (err.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          debug.error('An error occurred:', err.error.message);
        } else if (err.error instanceof ProgressEvent) {
          debug.error('Progress event error', err.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          debug.error(err.error);
          debug.error(
            `Backend returned code ${err.status}, ` +
            `body was: ${err.error}`);

          return of(new HttpResponse({
            body: err.error || err.message,
            headers: err.headers,
            status: err.status,
            statusText: err.statusText,
            url: err.url || undefined,
          }));
        }
        return observableThrowError(err);
      }),
    );
  }

  sendRequest(url: string, opts: SendRequestOptions) {
    const files = opts.files && opts.files.length ? opts.files.filter(file => file && file.data instanceof File && file.name) : undefined;

    this.setUrl(url)
      .setHTTPMethod(opts.method)
      // Skip json default headers for files
      .setHeaders(opts.headers, { skipDefaults: this.isGETRequest(opts.method) || !!(files && files.length) });

    return this._send({
      query: opts.query,
      variables: opts.variables,
      selectedOperation: opts.selectedOperation,
      files,
      withCredentials: opts.withCredentials,
    });
  }

  isGETRequest(method = this.method) {
    return method.toLowerCase() === 'get';
  }

  setHeaders(headers: fromHeaders.Header[] = [], opts = { skipDefaults: false }) {
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

  getParamsFromData(data: { [key: string]: any }) {
    return Object.keys(data)
      .reduce(
        (params, key) => data[key] ? params.set(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]) : params,
        new HttpParams()
      );
  }

  getUrl() {
    return this.api_url;
  }

  setUrl(url: string) {
    this.api_url = url;
    return this;
  }

  setHTTPMethod(httpVerb: string) {
    this.method = httpVerb;
    return this;
  }

  getIntrospectionRequest(url: string, opts: IntrospectionRequestOptions): Observable<any> {
    const requestOpts = {
      query: getIntrospectionQuery(),
      headers: opts.headers,
      method: opts.method,
      withCredentials: opts.withCredentials,
      variables: '{}',
    };
    return this.sendRequest(url, requestOpts).pipe(
      map(data => {
        debug.log('introspection', data);
        if (!data.ok) {
          throw new Error(`Introspection request failed with: ${data.status}`);
        }
        return data;
      }),
      catchError((err) => {
        debug.log('Error from first introspection query.', err);

        // Try the old introspection query
        return this.sendRequest(url, { ...requestOpts, query: oldIntrospectionQuery })
          .pipe(map(data => {
            debug.log('old introspection', data);
            if (!data.ok) {
              throw new Error(`Introspection request failed with: ${data.status}`);
            }
            return data;
          }));
      }),
    );
  }

  getIntrospectionData() {
    return this.introspectionData;
  }

  getIntrospectionSchema(data: any): GraphQLSchema | null {
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

  hasInvalidFileVariable(fileVariables: fromVariables.FileVariable[]) {
    return fileVariables.filter(file => !file || !(file.data instanceof File) || !file.name).length;
  }

  getActualTypeName(type: GraphQLType) {
    if (type) {
      return type.inspect().replace(/[\[\]!]/g, '');
    }
    return '';
  }

  fillAllFields(schema: GraphQLSchema, query: string, cursor: CodeMirror.Position, token: Token, opts: any) {
    return fillAllFields(schema, query, cursor, token, opts);
  }

  parseQuery(query: string) {
    if (!query) {
      return <DocumentNode>{};
    }
    try {
      return parse(query);
    } catch (err) {
      debug.error('Something wrong with your query', err);

      return <DocumentNode>{};
    }
  }

  /**
   * Check if the schema is a valid GraphQL schema
   * @param schema The schema object instance
   */
  isSchema(schema: any) {
    return schema instanceof GraphQLSchema;
  }

  /**
   * Checks if a query contains a subscription operation
   * @param query
   */
  isSubscriptionQuery(query: string) {

    const parsedQuery = this.parseQuery(query);

    if (!parsedQuery.definitions) {
      return false;
    }

    return parsedQuery.definitions.reduce((acc, cur) => {
      return acc || (cur.kind === 'OperationDefinition' && cur.operation === 'subscription');
    }, false);
  }

  createSubscriptionClient(subscriptionUrl: string, opts?: SubscriptionClientOptions): SubscriptionClient {
    return new SubscriptionClient(subscriptionUrl, {
      reconnect: true,
      ...opts
    });
  }

  closeSubscriptionClient(subscriptionClient: SubscriptionClient) {
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
        .filter((def): def is OperationDefinitionNode =>
          !!(def.kind === 'OperationDefinition' && def.name && def.name.value));
    }

    return [];
  }

  getOperationAtIndex(query: string, index: number) {
    return this.getOperations(query).find(operation => {
      return Boolean(operation.loc && operation.loc.start <= index && operation.loc.end >= index);
    });
  }

  getOperationNameAtIndex(query: string, index: number): string {
    const operation = this.getOperationAtIndex(query, index);

    if (operation) {
      return (operation.name && operation.name.value) ? operation.name.value : '';
    }
    return '';
  }

  // Check if there are more than one operations in the query
  // If check if there is already a selected operation
  // Check if the selected operation matches any operation, else ask the user to select again
  getSelectedOperationData({
    query = '',
    queryCursorIndex,
    selectedOperation = '',
    selectIfOneOperation = false
  }: { query: string, queryCursorIndex?: number, selectedOperation?: SelectedOperation, selectIfOneOperation?: boolean }) {
    let newSelectedOperation = null;
    const operations = this.getOperations(query);
    let requestSelectedOperationFromUser = false;

    // Need to choose an operation
    if (operations) {
      // def.name.Kind = 'Name' is not set when the name is anonymous (#0, #1, etc.. set by the graphql parse() method)
      const availableOperationNames = operations
        .map(def => def.name && def.name.kind === 'Name' && def.name.value)
        .filter(Boolean) as string[];

      if (availableOperationNames.length > 1) {
        let operationNameAtCursorIndex = '';
        if (typeof queryCursorIndex !== 'undefined') {
          operationNameAtCursorIndex = this.getOperationNameAtIndex(query, queryCursorIndex);
        }

        if ((selectedOperation && !availableOperationNames.includes(selectedOperation)) || !selectedOperation) {
          if (operationNameAtCursorIndex) {
            newSelectedOperation = operationNameAtCursorIndex;
          } else {
            newSelectedOperation = null;
            // Ask the user to select operation
            requestSelectedOperationFromUser = true;
          }
        } else {
          newSelectedOperation = selectedOperation;
        }
      } else {
        if (selectIfOneOperation) {
          newSelectedOperation = availableOperationNames[0] || null;
        } else {
          newSelectedOperation = null;
        }
      }
    } else {
      newSelectedOperation = null;
    }

    return { selectedOperation: newSelectedOperation, operations, requestSelectedOperationFromUser };
  }

  /**
   * Prettifies (formats) a given query
   * @param query
   */
  async prettify(query: string, tabWidth: number = 2) {
    const prettier = await import('prettier/standalone');
    const prettierGraphql = await import('prettier/parser-graphql');
    // return print(parse(query));
    return prettier.format(query, { parser: 'graphql', plugins: [ prettierGraphql ], tabWidth });
  }

  /**
   * Compresses a given query
   * @param query
   */
  async compress(query: string) {
    return compress(await this.prettify(query));
  }

  /**
   * Gives a name to an anonymous query
   */
  nameQuery(query: string) {
    if (!query) {
      return;
    }
    const ast = this.parseQuery(query);
    const edited = visit(ast, {
      OperationDefinition(node) {
        debug.log(node);
        const NameKind = node.name || {
          kind: 'Name',
          value: generateRandomNameForString(query),
        };
        return {
          ...node,
          name: NameKind,
        };
      }
    });

    return print(edited);
  }

  refactorQuery(query: string, schema: GraphQLSchema) {

    if (!query || !schema) {
      return;
    }
    const ast = this.parseQuery(query);
    const typeUsageEntries = generateTypeUsageEntries(ast, schema);

    const fragmentRefactorMap = generateFragmentRefactorMap(typeUsageEntries);
    const stripped = refactorFieldsWithFragmentSpread(ast, fragmentRefactorMap, schema);
    const documentWithFragments = addFragmentDefinitionFromRefactorMap(stripped, fragmentRefactorMap, schema);
    const argumentRefactorResult = refactorArgumentsToVariables(documentWithFragments, schema);

    // debug.log('REFACTOR', ast, edited, fragmentRefactorMap, print(argumentRefactorResult.document), argumentRefactorResult.variables);
    return {
      query: print(argumentRefactorResult.document),
      variables: argumentRefactorResult.variables,
    };
  }

  /**
   * Return the Schema Definition Language of the provided schema
   * @param schema
   */
  async getSDL(schema: GraphQLSchema) {
    if (this.isSchema(schema)) {
      return this.prettify(printSchema(schema));
    }
    return '';
  }

  sdlToSchema(sdl: string): GraphQLSchema {
    return buildSchema(sdl);
  }

  validateSchema(schema: GraphQLSchema) {
    return validateSchema(schema);
  }

  createStreamClient(streamUrl: string): EventSource {
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
