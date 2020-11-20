import { SubscriptionProvider, SubscriptionProviderExecuteOptions } from '../subscription-provider';
import { Observable } from 'rxjs';
import ActionCable from 'actioncable'
import ActionCableLink from 'graphql-ruby-client/dist/subscriptions/ActionCableLink'

export class WebsocketSubscriptionProvider extends SubscriptionProvider {
  subscription?: any;

  execute(options: SubscriptionProviderExecuteOptions) {
    const cable = ActionCable.createConsumer(this.subscriptionUrl) // must contain token param for auth reasons
    const cableLink = new ActionCableLink({cable})

    return new Observable((subscriber) => {

      var channelId = Math.round(Date.now() + Math.random() * 100000).toString(16)
      var actionName = "execute"
      this.subscription = cable.subscriptions.create(Object.assign({},{
        channel: "GraphqlChannel",
        channelId: channelId
      }, {}), {
        connected: function() {
          console.log("~~~~~ CONNECTED")
          this.perform(
            actionName,
            {
              query: options.query,
              variables: options.variables,
              operationName: options.operationName
            }
          )
        },
        received: function(payload) {
          console.log("~~~~~ RECEIVED")
          if (payload.result.data || payload.result.errors) {
            subscriber.next(payload.result)
          }

          if (!payload.more) {
            subscriber.complete()
          }
        }
      })
    });
  }

  close() {
    console.log("~~~~ CLOSE PLZ")
    this.subscription.unsubscribe()
  }
}
