import { Observable, of, throwError } from 'rxjs';

import { map, catchError, switchMap, toArray } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

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
import { ContextToken } from 'graphql-language-service';
import compress from 'graphql-query-compress';

import { NotifyService } from '../notify/notify.service';

import { oldIntrospectionQuery } from './oldIntrospectionQuery';
import { buildClientSchema as oldBuildClientSchema } from './oldBuildClientSchema';
import { debug } from '../../utils/logger';

import { fillAllFields, FillAllFieldsOptions } from './fillFields';
import { isElectronApp, parseJson } from '../../utils';
import { Omit } from '../../interfaces/shared';
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
import { prettify } from './prettifier';
import { Position } from '../../utils/editor/helpers';
import {
  ALTAIR_WINDOW_ID_HEADER,
  ELECTRON_ALLOWED_FORBIDDEN_HEADERS,
} from '@altairgraphql/electron-interop/build/constants';
import { SendRequestResponse } from 'altair-graphql-core/build/script/types';
import { HttpRequestHandler } from 'altair-graphql-core/build/request/handlers/http';
import {
  GraphQLRequestHandler,
  MultiResponseStrategy,
} from 'altair-graphql-core/build/request/types';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { buildResponse } from 'altair-graphql-core/build/request/response-builder';

interface SendRequestOptions {
  url: string;
  query: string;
  method: string;
  windowId: string;
  withCredentials?: boolean;
  variables?: string;
  extensions?: string;
  headers?: HeaderState;
  files?: FileVariable[];
  selectedOperation?: SelectedOperation;
  additionalParams?: string;
  batchedRequest?: boolean;
  handler?: GraphQLRequestHandler;
}

export const BATCHED_REQUESTS_OPERATION = 'BatchedRequests';

interface ResolvedFileVariable {
  name: string;
  data: File;
}
interface IntrospectionRequestOptions
  extends Omit<
    SendRequestOptions,
    'query' | 'batchedRequest' | 'files' | 'selectedOperation'
  > {
  windowId: string;
  inputValueDeprecation?: boolean;
  descriptions?: boolean;
  directiveIsRepeatable?: boolean;
  schemaDescription?: boolean;
  specifiedByUrl?: boolean;
}

@Injectable()
export class GqlService {
  private http = inject(HttpClient);
  private notifyService = inject(NotifyService);

  defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  headers = new HttpHeaders();
  introspectionData = {};

  getIntrospectionRequest(opts: IntrospectionRequestOptions) {
    return this._getIntrospectionRequest(opts).pipe(
      toArray(),
      switchMap((resps) => {
        const lastResponse = resps.at(-1);

        if (!lastResponse) {
          return throwError(() => new Error('No response!'));
        }

        // concatenate the responses to get the full introspection data
        const builtResponse = buildResponse(
          resps.map((r) => ({
            content: r.body,
            timestamp: r.requestEndTime,
          })),
          MultiResponseStrategy.CONCATENATE
        );

        lastResponse.body = builtResponse[0]?.content ?? '';
        return of(lastResponse);
      })
    );
  }

  private _getIntrospectionRequest(opts: IntrospectionRequestOptions) {
    const requestOpts: SendRequestOptions = {
      url: opts.url,
      query: getIntrospectionQuery({
        descriptions: opts.descriptions ?? true,
        inputValueDeprecation: opts.inputValueDeprecation,
        directiveIsRepeatable: opts.directiveIsRepeatable,
        schemaDescription: opts.schemaDescription,
        specifiedByUrl: opts.specifiedByUrl,
      }),
      headers: opts.headers,
      method: opts.method,
      withCredentials: opts.withCredentials,
      variables: opts.variables,
      extensions: opts.extensions,
      selectedOperation: 'IntrospectionQuery',
      additionalParams: opts.additionalParams,
      handler: opts.handler,
      windowId: opts.windowId,
    };
    return this.sendRequestV2(requestOpts).pipe(
      map((data) => {
        debug.log('introspection', data.body);
        if (!data.ok) {
          throw new Error(`Introspection request failed with: ${data.status}`);
        }
        return data;
      }),
      catchError((err) => {
        debug.log('Error from first introspection query.', err);

        // Try the old introspection query
        return this.sendRequestV2({
          ...requestOpts,
          query: oldIntrospectionQuery,
        }).pipe(
          map((data) => {
            debug.log('old introspection', data);
            if (!data.ok) {
              throw new Error(`Introspection request failed with: ${data.status}`);
            }
            return data;
          })
        );
      })
    );
  }

  getIntrospectionSchema(introspection?: IntrospectionQuery): GraphQLSchema | null {
    if (!introspection?.__schema) {
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
        this.notifyService.error(`
            Looks like the GraphQL schema is invalid.
            Please check that your schema in your GraphQL server conforms to the latest GraphQL spec.
          `);
      }

      return null;
    }
  }

  hasInvalidFileVariable(fileVariables: FileVariable[]) {
    const { erroneousFiles } = this.normalizeFiles(fileVariables);
    return Boolean(erroneousFiles.length);
  }

  fillAllFields(
    schema: GraphQLSchema,
    query: string,
    cursor: Position,
    token: ContextToken,
    opts: FillAllFieldsOptions
  ) {
    return fillAllFields(schema, query, cursor, token, opts);
  }

  /**
   *
   * @param query parses a query string
   * @throws {GraphQLError}
   */
  parseQuery(query: string) {
    return parse(query);
  }

  parseQueryOrEmptyDocument(query: string) {
    if (!query) {
      return this.getEmptyDocumentNode();
    }

    try {
      return this.parseQuery(query);
    } catch (err) {
      debug.log('Could not parse query', err);

      return this.getEmptyDocumentNode();
    }
  }

  getEmptyDocumentNode(): DocumentNode {
    return {
      definitions: [],
      kind: 'Document',
    };
  }

  /**
   * Check if the schema is a valid GraphQL schema
   * @param schema The schema object instance
   */
  isSchema(schema: unknown) {
    return schema instanceof GraphQLSchema;
  }

  /**
   * Checks if a query contains a subscription operation
   * @param query
   */
  isSubscriptionQuery(query: string, state: PerWindowState) {
    const { operations, selectedOperation } = this.calculateSelectedOperation(
      state,
      query
    );
    if (operations?.length && selectedOperation) {
      return operations.some((operation) => {
        return (
          operation.name?.value === selectedOperation &&
          operation.operation === 'subscription'
        );
      });
    }
    const parsedQuery = this.parseQueryOrEmptyDocument(query);
    return parsedQuery.definitions.reduce((acc, cur) => {
      return (
        acc ||
        (cur.kind === 'OperationDefinition' && cur.operation === 'subscription')
      );
    }, false);
  }

  getOperations(query: string) {
    const parsedQuery = this.parseQueryOrEmptyDocument(query);

    if (parsedQuery.definitions) {
      return parsedQuery.definitions.filter(
        (def): def is OperationDefinitionNode =>
          !!(def.kind === 'OperationDefinition' && def.name && def.name.value)
      );
    }

    return [];
  }

  getOperationAtIndex(query: string, index: number) {
    return this.getOperations(query).find((operation) => {
      return Boolean(
        operation.loc && operation.loc.start <= index && operation.loc.end >= index
      );
    });
  }

  getOperationNameAtIndex(query: string, index: number): string {
    const operation = this.getOperationAtIndex(query, index);

    if (operation) {
      return operation?.name?.value ?? '';
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
    selectIfOneOperation = false,
  }: {
    query: string;
    queryCursorIndex?: number;
    selectedOperation?: SelectedOperation;
    selectIfOneOperation?: boolean;
  }) {
    let newSelectedOperation: string | null = null;
    const operations = this.getOperations(query);
    let requestSelectedOperationFromUser = false;

    // Need to choose an operation
    if (operations) {
      // def.name.Kind = 'Name' is not set when the name is anonymous (#0, #1, etc.. set by the graphql parse() method)
      const availableOperationNames = operations
        .map((def) => def.name && def.name.kind === 'Name' && def.name.value)
        .filter(Boolean) as string[];

      if (availableOperationNames.length > 1) {
        let operationNameAtCursorIndex = '';
        if (typeof queryCursorIndex !== 'undefined') {
          operationNameAtCursorIndex = this.getOperationNameAtIndex(
            query,
            queryCursorIndex
          );
        }

        if (
          (selectedOperation &&
            !availableOperationNames.includes(selectedOperation)) ||
          !selectedOperation
        ) {
          if (selectedOperation === BATCHED_REQUESTS_OPERATION) {
            newSelectedOperation = null;
          } else if (operationNameAtCursorIndex) {
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

    return {
      selectedOperation: newSelectedOperation,
      operations,
      requestSelectedOperationFromUser,
    };
  }

  calculateSelectedOperation(state: PerWindowState, query: string) {
    try {
      const queryEditorIsFocused = state.query.queryEditorState?.isFocused;
      const operationData = this.getSelectedOperationData({
        query,
        selectedOperation: state.query.selectedOperation,
        selectIfOneOperation: true,
        queryCursorIndex: queryEditorIsFocused
          ? state.query.queryEditorState.cursorIndex
          : undefined,
      });
      if (operationData.requestSelectedOperationFromUser) {
        return {
          selectedOperation: '',
          operations: operationData.operations,
          error: `You have more than one query operations. You need to select the one you want to run from the dropdown.`,
        };
      }
      return {
        selectedOperation: operationData.selectedOperation,
        operations: operationData.operations,
      };
    } catch (err) {
      debug.error(err);
      return {
        selectedOperation: '',
        error: 'Could not select operation',
      };
    }
  }

  /**
   * Prettifies (formats) a given query
   * @param query
   */
  async prettify(query: string, tabWidth = 2) {
    return prettify(query, tabWidth);
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
    const ast = this.parseQueryOrEmptyDocument(query);
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
      },
    });

    return print(edited);
  }

  refactorQuery(query: string, schema: GraphQLSchema) {
    if (!query || !schema) {
      return;
    }
    const ast = this.parseQueryOrEmptyDocument(query);
    const typeUsageEntries = generateTypeUsageEntries(ast, schema);

    const fragmentRefactorMap = generateFragmentRefactorMap(typeUsageEntries);
    const stripped = refactorFieldsWithFragmentSpread(
      ast,
      fragmentRefactorMap,
      schema
    );
    const documentWithFragments = addFragmentDefinitionFromRefactorMap(
      stripped,
      fragmentRefactorMap,
      schema
    );
    const argumentRefactorResult = refactorArgumentsToVariables(
      documentWithFragments,
      schema
    );

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

    files.forEach((file) => {
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
            let n = `${file.name}.${i}`;
            // check if name contains the $$ placeholder, and replace it with the index
            if (file.name.split('.').includes('$$')) {
              n = file.name
                .split('.')
                .map((part) => {
                  return part === '$$' ? i : part;
                })
                .join('.');
            }
            const newFileVariable = {
              name: n,
              data: fileData,
            };

            const result = this.normalizeFiles([newFileVariable]);

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

        const result = this.normalizeFiles([newFileVariable]);

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

  sendRequestV2({
    url,
    method,
    query,
    variables,
    headers = [],
    extensions,
    selectedOperation,
    files,
    withCredentials,
    batchedRequest,
    additionalParams,
    windowId,
    handler = new HttpRequestHandler(),
  }: SendRequestOptions): Observable<SendRequestResponse> {
    // wrapping the logic to properly handle any errors (both within and outside the observable)
    return of(undefined).pipe(
      switchMap(() => {
        const { resolvedFiles } = this.normalizeFiles(files);

        if (headers?.length) {
          // Filter out headers that are not allowed
          headers = headers.filter((header) => {
            return (
              !ELECTRON_ALLOWED_FORBIDDEN_HEADERS.includes(
                header.key.toLowerCase()
              ) &&
              header.enabled &&
              header.key &&
              header.value
            );
          });
        }
        if (isElectronApp()) {
          // Set window id header for electron app
          headers = [
            ...headers,
            {
              key: ALTAIR_WINDOW_ID_HEADER,
              value: windowId,
              enabled: true,
            },
          ];
        }

        // valiate variables
        if (variables) {
          try {
            JSON.parse(variables);
          } catch (err) {
            throw new Error('Variables is not valid JSON');
          }
        }

        // validate extensions
        if (extensions) {
          try {
            JSON.parse(extensions);
          } catch (err) {
            throw new Error('Request extensions is not valid JSON');
          }
        }

        return handler
          .handle({
            url,
            method,
            query,
            variables: variables ? parseJson(variables, {}) : undefined,
            headers,
            extensions: extensions ? parseJson(extensions, {}) : undefined,
            selectedOperation,
            files: resolvedFiles,
            withCredentials,
            batchedRequest,
            additionalParams: additionalParams
              ? parseJson(additionalParams, {})
              : undefined,
          })
          .pipe(
            map((response) => {
              return {
                ok: response.ok,
                body: response.data,
                headers: Object.fromEntries(response.headers),
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                requestStartTime: response.requestStartTimestamp,
                requestEndTime: response.requestEndTimestamp,
                responseTime: response.responseTimeMs,
              };
            })
          );
      }),

    );
  }
}
