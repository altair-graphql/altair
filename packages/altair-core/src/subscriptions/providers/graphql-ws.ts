import { SubscriptionProvider, SubscriptionProviderExecuteOptions } from '../subscription-provider';
import { Observable } from 'rxjs';
import { Client, createClient } from 'graphql-ws';

export class GraphQLWsSubscriptionProvider extends SubscriptionProvider {
  client?: Client;
  cleanup?: () => void;

  createClient() {
    this.client = createClient({
      url: this.subscriptionUrl,
      connectionParams: this.connectionParams,
      lazy: false,
      onNonLazyError: (err) => {
        this.extraOptions?.onConnected?.(err, undefined);
      },
      on: {
        connected: () => {
          this.extraOptions?.onConnected?.(undefined, undefined);
        },
        error: (err) => {
          this.extraOptions?.onConnected?.(err, undefined);
        }
      }
    });
  }

  execute(options: SubscriptionProviderExecuteOptions) {
    this.createClient();

    if (!this.client) {
      throw new Error('Could not create subscription client!');
    }

    return new Observable((subscriber) => {
      this.cleanup = this.client!.subscribe({
        query: options.query,
        variables: options.variables,
        operationName: options.operationName,
      }, {
        next: (...args) =>  subscriber.next(...args),
        error: (...args) => subscriber.error(...args),
        complete: () => subscriber.complete(),
      });
    });
  }

  close() {
    this.cleanup?.();
    this.cleanup = undefined;
    this.client?.dispose();
    this.client = undefined;
  }
}
