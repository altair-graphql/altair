import { Observable, Subscriber } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { simpleResponseObserver } from '../utils';

export class WebsocketRequestHandler implements GraphQLRequestHandler {
  client?: SubscriptionClient;
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
      this.client = new SubscriptionClient(request.url, {
        reconnect: true,
        connectionParams: request.additionalParams,
        connectionCallback: (error, result) => {
          this.onConnected(subscriber, error, result);
        },
      });

      if (!this.client) {
        throw new Error('Could not create WS client!');
      }
      const requestStartTimestamp = Date.now();

      const res = this.client
        .request({
          query: request.query,
          variables: request.variables,
          operationName: request.selectedOperation ?? undefined,
        })
        .subscribe(
          simpleResponseObserver(subscriber, request.url, requestStartTimestamp)
        );
      this.cleanup = res.unsubscribe;

      return () => {
        this.destroy();
      };
    });
  }

  async destroy() {
    this.cleanup?.();
    this.cleanup = undefined;
    this.client?.unsubscribeAll();
    this.client?.close();
    this.client = undefined;
  }
}
