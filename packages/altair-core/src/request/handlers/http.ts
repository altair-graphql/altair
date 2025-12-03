import { Observable, Subscriber, from } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { SelectedOperation } from '../../types/state/query.interfaces';
import { setByDotNotation } from '../../utils/dot-notation';
import { print } from 'graphql';
import { getOperations } from '../../utils/graphql';
import { meros } from 'meros/browser';
import compress from 'graphql-query-compress';

interface GraphQLRequestData {
  query: string;
  variables: Record<string, unknown>;
  operationName?: SelectedOperation;
  extensions?: Record<string, unknown>;
}

export class HttpRequestHandler implements GraphQLRequestHandler {
  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData> {
    // Make the request and return an observable
    return new Observable<GraphQLResponseData>((observer) => {
      const aborter = new AbortController();
      const data = this.getData(request);
      const params = this.isGETRequest(request.method)
        ? this.getParamsFromData(data)
        : undefined;

      const requestStartTime = Date.now();
      // Make the request
      fetch(this.getUrl(request.url, params), {
        method: request.method,
        headers: this.getHeaders(request),
        body: this.getBody(request, data),
        credentials: request.withCredentials ? 'include' : 'same-origin',
        signal: aborter.signal,
      })
        .then(async (response) => {
          return { response, merosResponse: await meros(response) };
        })
        .then(async (result) => {
          const requestEndTime = Date.now();
          const { response, merosResponse } = result;

          if (merosResponse instanceof Response) {
            // meros couldn't handle the response, so we'll handle it ourselves

            if (!merosResponse.ok || !merosResponse.body) {
              //  don't handle streaming
              const buffer = await merosResponse.arrayBuffer();
              return this.emitChunk(
                merosResponse,
                new Uint8Array(buffer),
                true,
                observer,
                requestStartTime,
                requestEndTime
              );
            }

            const reader = merosResponse.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              this.emitChunk(
                merosResponse,
                value,
                done,
                observer,
                requestStartTime,
                requestEndTime
              );
              if (done) {
                return true;
              }
            }
          }

          // Handle the response from meros
          return from(merosResponse).subscribe({
            next: (chunk) => {
              this.emitChunk(
                response,
                chunk.json ? JSON.stringify(chunk.body) : chunk.body,
                false,
                observer,
                requestStartTime,
                requestEndTime
              );
            },
            error: (error) => {
              observer.error(error);
            },
            complete: () => {
              this.emitChunk(
                response,
                undefined,
                true,
                observer,
                requestStartTime,
                requestEndTime
              );
            },
          });
        })
        .catch((error) => {
          if (error?.name === 'AbortError') {
            // Request was aborted
            observer.complete();
            return;
          }
          // Send the error to the observer
          observer.error(error);
        });

      // Return a function that will be called when the observable is unsubscribed
      return () => {
        // Cancel the ongoing request if unsubscribed
        aborter.abort();
      };
    });
  }

  destroy() {
    // throw new Error('Method not implemented.');
  }

  private emitChunk(
    response: Response,
    chunk: Uint8Array | string | undefined,
    done: boolean,
    observer: Subscriber<GraphQLResponseData>,
    requestStartTime: number,
    requestEndTime: number
  ) {
    if (chunk) {
      const value =
        typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
      const res: GraphQLResponseData = {
        ok: response.ok,
        data: value,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        requestStartTimestamp: requestStartTime,
        requestEndTimestamp: requestEndTime,
        // this is redundant data
        responseTimeMs: requestEndTime - requestStartTime,
      };

      // Send the data to the observer
      observer.next(res);
    }

    if (done) {
      observer.complete();
    }

    return true;
  }

  private isGETRequest(method: string) {
    return method.toLowerCase() === 'get';
  }
  private getParamsFromData(data: GraphQLRequestData) {
    return Object.entries(data).reduce((params, [key, value]) => {
      if (value) {
        const parsedValue =
          typeof value === 'object' ? JSON.stringify(value) : value.toString();
        params.set(key, parsedValue);
      }
      return params;
    }, new URLSearchParams());
  }
  private getHeaders(request: GraphQLRequestOptions) {
    const headers = new Headers();
    const jsonHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    // with files, needs to be form data
    // GET request, needs to be query params
    const addJsonHeaders =
      !this.isGETRequest(request.method) && !request.files?.length;

    if (addJsonHeaders) {
      Object.entries(jsonHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // Add the rest of the headers
    request.headers?.forEach((header) => {
      headers.set(header.key, header.value);
    });

    return headers;
  }
  private getUrl(url: string, params?: URLSearchParams) {
    const u = new URL(url);
    if (params) {
      u.search = params.toString();
    }
    return u.href;
  }
  private getData(request: GraphQLRequestOptions) {
    const data: GraphQLRequestData = {
      query: request.query,
      variables: request.variables ?? {},
      extensions: request.extensions,
      operationName: null,
    };

    if (request.selectedOperation) {
      data.operationName = request.selectedOperation;
    }

    return data;
  }
  private getBody(request: GraphQLRequestOptions, data: GraphQLRequestData) {
    // with files, needs to be form data
    // with neither, needs to be JSON

    // GET request, needs to be query params, so no body
    if (this.isGETRequest(request.method)) {
      return;
    }

    // Handle file uploads
    if (request.files?.length) {
      // https://github.com/jaydenseric/graphql-multipart-request-spec#multipart-form-field-structure
      // 1. operations: JSON string of the data, with the files in variables replaced by null
      // 2. map: JSON string of the file map, where the key is the index of the file in the files array, and the value is the path to the file in the operations JSON
      // 3. files: the files themselves, with the key being the index of the file in the files array
      const fileMap: Record<string, string[]> = {};
      request.files.forEach((file, i) => {
        // this mutation should be done before setting the stringified data
        setByDotNotation(data.variables, file.name, null);
        fileMap[i] = [`variables.${file.name}`];
      });
      const formData = new FormData();
      formData.append('operations', JSON.stringify(data));
      formData.append('map', JSON.stringify(fileMap));
      request.files.forEach((file, i) => {
        formData.append(`${i}`, file.data ?? '');
      });

      return formData;
    }

    // Handle batched requests
    if (request.batchedRequest) {
      const operations = getOperations(data.query);
      if (operations.length > 1) {
        const operationQueries = operations.map((operation) => {
          const operationName = operation.name?.value;
          const operationQuery = compress(print(operation));
          const operationVariables = data.variables;
          const operationExtensions = data.extensions;

          return {
            operationName,
            query: operationQuery,
            variables: operationVariables,
            extensions: operationExtensions,
          };
        });

        return JSON.stringify(operationQueries);
      }
    }
    return JSON.stringify(data);
  }
}
