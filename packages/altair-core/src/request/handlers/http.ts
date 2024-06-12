import { Observable } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { SelectedOperation } from '../../types/state/query.interfaces';
import { setByDotNotation } from '../../utils/dot-notation';
import { print } from 'graphql';
import { getOperations } from '../../utils/graphql';

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
          const requestEndTime = Date.now();

          // TODO: Implement streaming
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding#chunked
          // Keep list of chunks and concatenate them
          // if (!response.ok || !response.body) {
          //   // TODO: don't handle streaming
          // }
          // const reader = response.body?.getReader();
          const res: GraphQLResponseData = {
            ok: response.ok,
            data: await response.text(),
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            requestStartTimestamp: requestStartTime,
            requestEndTimestamp: requestEndTime,
            // this is redundant data
            resopnseTimeMs: requestEndTime - requestStartTime,
          };
          return res;
        })
        .then((res) => {
          // Send the data to the observer
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
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
      variables: {},
      operationName: null,
    };

    if (request.selectedOperation) {
      data.operationName = request.selectedOperation;
    }

    // If there is a variables option, add it to the data
    if (request.variables) {
      try {
        data.variables = JSON.parse(request.variables);
      } catch (err) {
        throw new Error('Variables is not valid JSON');
      }
    }

    // if there is an extensions option, add it to the data
    if (request.extensions) {
      try {
        data.extensions = JSON.parse(request.extensions);
      } catch (err) {
        throw new Error('Request extensions is not valid JSON');
      }
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
          const operationQuery = print(operation);
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
