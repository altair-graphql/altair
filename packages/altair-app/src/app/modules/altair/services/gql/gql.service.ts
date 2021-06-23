import {throwError as observableThrowError, Observable, of } from 'rxjs';

import { map, catchError } from 'rxjs/operators';
import { HttpHeaders, HttpClient, HttpResponse, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  OperationDefinitionNode,
  IntrospectionQuery,
} from 'graphql';
import compress from 'graphql-query-compress';

import { NotifyService } from '../notify/notify.service';

import { oldIntrospectionQuery } from './oldIntrospectionQuery';
import { buildClientSchema as oldBuildClientSchema } from './oldBuildClientSchema';
import { debug } from '../../utils/logger';

import * as fromHeaders from '../../store/headers/headers.reducer';
import * as fromVariables from '../../store/variables/variables.reducer';
import { fillAllFields } from './fillFields';
import { setByDotNotation } from '../../utils';
import { Token } from 'codemirror';
import { IDictionary, Omit } from '../../interfaces/shared';
import {
  refactorFieldsWithFragmentSpread,
  generateTypeUsageEntries,
  generateFragmentRefactorMap,
  addFragmentDefinitionFromRefactorMap,
  refactorArgumentsToVariables,
  generateRandomNameForString,
} from './helpers';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import { FileVariable } from 'altair-graphql-core/build/types/state/variable.interfaces';
import { SelectedOperation } from 'altair-graphql-core/build/types/state/query.interfaces';


interface SendRequestOptions {
  query: string;
  method: string;
  withCredentials?: boolean;
  variables?: string;
  headers?: HeaderState;
  files?: FileVariable[];
  selectedOperation?: SelectedOperation;
};

export interface SendRequestResponse {
  response: HttpResponse<any>;
  meta: {
      requestStartTime: number;
      requestEndTime: number;
      responseTime: number;
      headers: IDictionary;
  };
}

interface ResolvedFileVariable { name: string; data: File; }
type IntrospectionRequestOptions = Omit<SendRequestOptions, 'query'>;

@Injectable()
export class GqlService {
  defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  headers: HttpHeaders;
  introspectionData = {};

  private api_url = localStorage.getItem('altair:url');
  private method = 'POST';

  constructor(
    private http: HttpClient,
    private notifyService: NotifyService
  ) {

    // Set the default headers on initialization
    this.setHeaders();
  }

  sendRequest(url: string, opts: SendRequestOptions): Observable<SendRequestResponse> {
    // Only need resolvedFiles to know if valid files exist at this point
    const { resolvedFiles } = this.normalizeFiles(opts.files);

    this.setUrl(url)
      .setHTTPMethod(opts.method)
      // Skip json default headers for files
      .setHeaders(opts.headers, { skipDefaults: this.isGETRequest(opts.method) || !!(resolvedFiles.length) });

    const requestStartTime = new Date().getTime();
    return this._send({
      query: opts.query,
      variables: opts.variables,
      selectedOperation: opts.selectedOperation,
      files: opts.files,
      withCredentials: opts.withCredentials,
    }).pipe(
      map((response) => {
        const requestEndTime = new Date().getTime();
        const requestElapsedTime = requestEndTime - requestStartTime;

        return {
          response,
          meta: {
            requestStartTime,
            requestEndTime,
            responseTime: requestElapsedTime,
            headers: response.headers.keys().reduce((acc, key) => ({ ...acc, [key]: response.headers.get(key)}), {}),
          }
        };
      }),
    );
  }

  isGETRequest(method = this.method) {
    return method.toLowerCase() === 'get';
  }

  setHeaders(headers: HeaderState = [], opts = { skipDefaults: false }) {
    let newHeaders = new HttpHeaders();
    if (!opts.skipDefaults) {
      newHeaders = new HttpHeaders(this.defaultHeaders);
    }

    const forbiddenHeaders = [ 'Origin' ];

    if (headers && headers.length) {
      headers.forEach(header => {
        if (!forbiddenHeaders.includes(header.key) && header.enabled && header.key && header.value) {
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

  setUrl(url: string) {
    this.api_url = url;
    return this;
  }

  setHTTPMethod(httpVerb: string) {
    this.method = httpVerb;
    return this;
  }

  getIntrospectionRequest(url: string, opts: IntrospectionRequestOptions) {
    const requestOpts: SendRequestOptions = {
      query: getIntrospectionQuery(),
      headers: opts.headers,
      method: opts.method,
      withCredentials: opts.withCredentials,
      variables: '{}',
      selectedOperation: 'IntrospectionQuery',
    };
    return this.sendRequest(url, requestOpts).pipe(
      map(data => {
        debug.log('introspection', data.response);
        if (!data.response.ok) {
          throw new Error(`Introspection request failed with: ${data.response.status}`);
        }
        return data;
      }),
      catchError((err) => {
        debug.log('Error from first introspection query.', err);

        // Try the old introspection query
        return this.sendRequest(url, { ...requestOpts, query: oldIntrospectionQuery })
          .pipe(map(data => {
            debug.log('old introspection', data);
            if (!data.response.ok) {
              throw new Error(`Introspection request failed with: ${data.response.status}`);
            }
            return data;
          }));
      }),
    );
  }

  getIntrospectionSchema(introspection?: IntrospectionQuery): GraphQLSchema | null {
    if (!introspection || !introspection.__schema) {
      return null;
    }

    try {
      // One type => many fields
      // One field => One type
      return buildClientSchema(introspection);
    } catch (err) {
      debug.log('Trying old buildClientSchema.', err);
      try {
        const schema = oldBuildClientSchema(introspection);

        this.notifyService.info(`
          Looks like your server is still using an old version of GraphQL (older than v0.5.0).
          You should upgrade to avoid broken implementations.
        `);
        return schema;
      } catch (err) {
        debug.log('Bad introspection data.', err);
        const errorMessage = err.message ? err.message : err.toString();
        this.notifyService
          .error(`
            Looks like the GraphQL schema is invalid.
            Please check that your schema in your GraphQL server conforms to the latest GraphQL spec.
            Error message: ${errorMessage}.
          `);
      }

      return null;
    }
  }

  hasInvalidFileVariable(fileVariables: FileVariable[]) {
    const { erroneousFiles } =  this.normalizeFiles(fileVariables);
    return Boolean(erroneousFiles.length);
  }

  fillAllFields(schema: GraphQLSchema, query: string, cursor: CodeMirror.Position, token: Token, opts: any) {
    return fillAllFields(schema, query, cursor, token, opts);
  }

  parseQuery(query: string) {
    const emptyDocumentNode: DocumentNode = {
      definitions: [],
      kind: 'Document',
    };

    if (!query) {
      return emptyDocumentNode;
    }
    try {
      return parse(query);
    } catch (err) {
      debug.error('Something wrong with your query', err);

      return emptyDocumentNode;
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

  getSDLSync(schema: GraphQLSchema) {
    if (this.isSchema(schema)) {
      return printSchema(schema);
    }
    return '';
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

  normalizeFiles(files?: FileVariable[]) {
    if (!files || !files.length) {
      return { resolvedFiles: [], erroneousFiles: files || [] };
    }


    let resolvedFiles: ResolvedFileVariable[] = [];
    let erroneousFiles: FileVariable[] = [];

    files.forEach(file => {
      if (!file.name) {
        erroneousFiles.push(file);
        return;
      }

      if (!file.data) {
        erroneousFiles.push(file);
        return;
      }

      // Only file variables specified as multiple are allowed to have an array of data
      if (file.isMultiple) {
        if (Array.isArray(file.data)) {
          file.data.forEach((fileData, i) => {
            const newFileVariable = {
              name: `${file.name}.${i}`,
              data: fileData,
            };

            const result = this.normalizeFiles([ newFileVariable ]);

            resolvedFiles = resolvedFiles.concat(result.resolvedFiles);
            erroneousFiles = erroneousFiles.concat(result.erroneousFiles);
          });
          return;
        }
        erroneousFiles.push(file);
        return;
      }

      if (Array.isArray(file.data)) {
        const newFileVariable = {
          name: file.name,
          data: file.data[0],
        };

        const result = this.normalizeFiles([ newFileVariable ]);

        resolvedFiles = resolvedFiles.concat(result.resolvedFiles);
        erroneousFiles = erroneousFiles.concat(result.erroneousFiles);
        return;
      }

      if (!(file.data instanceof File)) {
        erroneousFiles.push(file);
        return;
      }

      resolvedFiles.push(file as ResolvedFileVariable);
    });

    return { resolvedFiles, erroneousFiles };
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
      const { resolvedFiles } = this.normalizeFiles(files);
      if (resolvedFiles && resolvedFiles.length) {
        // https://github.com/jaydenseric/graphql-multipart-request-spec#multipart-form-field-structure
        const fileMap: any = {};
        data.variables = data.variables || {};
        resolvedFiles.forEach((file, i) => {
          setByDotNotation(data.variables, file.name, null);
          fileMap[i] = [ `variables.${file.name}` ];
        });
        const formData = new FormData();
        formData.append('operations', JSON.stringify(data));
        formData.append('map', JSON.stringify(fileMap));
        resolvedFiles.forEach((file, i) => {
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
}
