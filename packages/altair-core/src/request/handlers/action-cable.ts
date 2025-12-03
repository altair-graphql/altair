import { Observable } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from '../types';
import ActionCable from 'actioncable';

export class ActionCableRequestHandler implements GraphQLRequestHandler {
  subscription?: any;
  channel?: string;
  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData> {
    return new Observable((subscriber) => {
      const requestStartTimestamp = Date.now();
      const cable = ActionCable.createConsumer(request.url);
      this.subscription = cable.subscriptions.create(
        {
          channel:
            typeof request.additionalParams?.channel === 'string'
              ? request.additionalParams.channel
              : 'GraphqlChannel',
          channelId: Math.round(Date.now() + Math.random() * 100000).toString(16),
        },
        {
          connected: function () {
            this.perform('execute', request);
          },
          received: function (payload: any) {
            if (payload.result.data || payload.result.errors) {
              const requestEndTimestamp = Date.now();

              subscriber.next({
                ok: true,
                data: JSON.stringify(payload.result),
                headers: new Headers(),
                status: 200,
                statusText: 'OK',
                url: request.url,
                requestStartTimestamp,
                requestEndTimestamp,
                responseTimeMs: requestEndTimestamp - requestStartTimestamp,
              });
            }

            if (!payload.more) {
              subscriber.complete();
            }
          },
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
  destroy(): void {
    this.subscription?.unsubscribe();
  }
}
