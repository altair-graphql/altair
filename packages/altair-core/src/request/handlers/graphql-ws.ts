import { Observable, Subscriber } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { Client, createClient } from 'graphql-ws';
import { simpleResponseObserver } from '../utils';

export class GraphQLWsRequestHandler implements GraphQLRequestHandler {
  client?: Client;
  cleanup?: () => void;

  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData> {
    return new Observable((subscriber) => {
      this.client = createClient({
        url: request.url,
        connectionParams: request.additionalParams,
        lazy: false,
        onNonLazyError: (err) => {
          subscriber.error(err);
        },
        on: {
          error: (err) => {
            subscriber.error(err);
          },
        },
      });

      if (!this.client) {
        throw new Error('Could not create GraphQL WS client!');
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
  generateCurl(request: GraphQLRequestOptions): string {
    throw new Error('Method not implemented.');
  }

  async destroy() {
    try {
      this.cleanup?.();
      this.cleanup = undefined;
      // This causes the 'Error: Uncaught (in promise): Event: {"isTrusted":true}' error
      await this.client?.dispose();
      this.client = undefined;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}
