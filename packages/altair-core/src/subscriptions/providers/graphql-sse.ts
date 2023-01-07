import {
  SubscriptionProvider,
  SubscriptionProviderExecuteOptions,
} from '../subscription-provider';
import { Observable } from 'rxjs';
import { Client, createClient } from 'graphql-sse';

export class GraphQLSSESubscriptionProvider extends SubscriptionProvider {
  client?: Client;
  cleanup?: () => void;

  createClient() {
    this.client = createClient({
      url: this.subscriptionUrl,
      headers: this.extraOptions?.headers,
    });
  }

  execute(options: SubscriptionProviderExecuteOptions) {
    this.createClient();

    if (!this.client) {
      throw new Error('Could not create subscription client!');
    }

    return new Observable((subscriber) => {
      this.cleanup = this.client!.subscribe(
        {
          query: options.query,
          variables: options.variables,
          operationName: options.operationName,
        },
        {
          next: (...args) => subscriber.next(...args),
          error: (...args) => subscriber.error(...args),
          complete: () => subscriber.complete(),
        }
      );
    });
  }

  async close() {
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
