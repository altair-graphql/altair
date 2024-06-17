import { Observable } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { Client, createClient } from 'graphql-sse';
import { simpleResponseObserver } from '../utils';

export class SSERequestHandler implements GraphQLRequestHandler {
  client?: Client;
  cleanup?: () => void;

  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData> {
    return new Observable((subscriber) => {
      this.client = createClient({
        url: request.url,
        credentials: request.withCredentials ? 'include' : 'same-origin',
        headers: request.headers?.reduce(
          (acc, { key, value }) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string, string>
        ),
      });

      if (!this.client) {
        throw new Error('Could not create SSE client!');
      }
      const requestStartTimestamp = Date.now();
      this.cleanup = this.client.subscribe(
        {
          query: request.query,
          variables: request.variables,
          operationName: request.selectedOperation ?? undefined,
          extensions: request.extensions,
        },
        simpleResponseObserver(subscriber, request.url, requestStartTimestamp)
      );

      return () => {
        this.destroy();
      };
    });
  }


  async destroy() {
    try {
      this.cleanup?.();
      this.cleanup = undefined;
      await this.client?.dispose();
      this.client = undefined;
    } catch (err) {
      console.error(err);
    }
  }
}
