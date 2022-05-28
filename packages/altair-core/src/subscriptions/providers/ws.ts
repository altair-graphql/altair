import { SubscriptionProvider, SubscriptionProviderExecuteOptions } from '../subscription-provider';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Observable } from 'rxjs';

export class WebsocketSubscriptionProvider extends SubscriptionProvider {
  client?: SubscriptionClient;
  cleanup?: () => void;

  createClient() {
    this.client = new SubscriptionClient(this.subscriptionUrl, {
      reconnect: true,
      connectionParams: this.connectionParams,
      connectionCallback: this.extraOptions?.onConnected
    });
  }

  execute(options: SubscriptionProviderExecuteOptions) {
    this.createClient();

    if (!this.client) {
      throw new Error('Could not create subscription client!');
    }

    return new Observable((subscriber) => {
      const res = this.client!.request({
        query: options.query,
        variables: options.variables,
        operationName: options.operationName,
      }).subscribe({
        next: (...args) =>  subscriber.next(...args),
        error: (...args) => subscriber.error(...args),
        complete: () => subscriber.complete(),
      });

      this.cleanup = res.unsubscribe;
    });
  }

  close() {
    this.cleanup?.();
    this.cleanup = undefined;
    this.client?.unsubscribeAll();
    this.client?.close();
    this.client = undefined;
  }
}
