import { Observable, Subscriber } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { Client, createClient } from 'graphql-ws';

export class GraphQLWsRequestHandler implements GraphQLRequestHandler {
  client?: Client;
  cleanup?: () => void;
  onConnected(
    subscriber: Subscriber<GraphQLResponseData>,
    error: unknown,
    data: unknown
  ) {
    if (error) {
      console.log('Subscription connection error', error);
      subscriber.error(error);
      return;
    }
    console.log('Connected subscription.');
  }

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
        {
          next: (res) => {
            const requestEndTimestamp = Date.now();

            subscriber.next({
              ok: true,
              data: JSON.stringify(res),
              headers: new Headers(),
              status: 200,
              statusText: 'OK',
              url: request.url,
              requestStartTimestamp,
              requestEndTimestamp,
              resopnseTimeMs: requestEndTimestamp - requestStartTimestamp,
            });
          },
          error: (...args) => subscriber.error(...args),
          complete: () => subscriber.complete(),
        }
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
