import { SubscriptionProvider, SubscriptionProviderExecuteOptions } from '../subscription-provider';
import { Observable } from 'rxjs';
import ActionCable from 'actioncable';


export class ActionCableSubscriptionProvider extends SubscriptionProvider {
  subscription?: any;
  channel?: string;

  execute(options: SubscriptionProviderExecuteOptions) {
    const cable = ActionCable.createConsumer(this.subscriptionUrl);

    return new Observable((subscriber) => {
      this.subscription = cable.subscriptions.create(Object.assign({}, {
        channel: this.connectionParams.channel || 'GraphqlChannel',
        channelId: Math.round(Date.now() + Math.random() * 100000).toString(16),
      }, {}), {
        connected: function() {
          this.perform('execute', options)
        },
        received: function(payload: any) {
          if (payload.result.data || payload.result.errors) {
            subscriber.next(payload.result)
          }

          if (!payload.more) {
            subscriber.complete()
          }
        }
      });
    });
  }

  close() {
    this.subscription?.unsubscribe()
  }
}
