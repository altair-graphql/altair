import { Observable } from 'rxjs';
import {
  GraphQLRequestHandler,
  GraphQLRequestOptions,
  GraphQLResponseData,
} from './types';
import {
  SubscriptionProvider,
  SubscriptionProviderConstructor,
} from '../subscriptions/subscription-provider';
import { headerListToMap } from '../utils/headers';
import { IDictionary } from '../types/shared';

/**
 * Adapter to convert a {@link SubscriptionProvider} to a {@link GraphQLRequestHandler}.
 * For historical context, the {@link SubscriptionProvider} was used to handle subscriptions in Altair,
 * but this was later replaced with the {@link GraphQLRequestHandler} which is more generic and works
 * for all types of GraphQL requests.
 */
export class SubscriptionProviderRequestHandlerAdapter
  implements GraphQLRequestHandler
{
  constructor(private providerClass: SubscriptionProviderConstructor) {}
  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData> {
    return new Observable((subscriber) => {
      const requestStartTimestamp = Date.now();
      const provider = new this.providerClass(
        request.url,
        request.additionalParams ?? {},
        {
          headers: headerListToMap(request.headers ?? []) as IDictionary,
          onConnected(error, data) {
            if (error) {
              subscriber.error(error);
            }
          },
        }
      );
      provider
        .execute({
          query: request.query,
          variables: request.variables,
          operationName: request.selectedOperation ?? undefined,
        })
        .subscribe({
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
        });
      return () => {
        provider.close();
      };
    });
  }
  generateCurl(request: GraphQLRequestOptions): string {
    throw new Error('Method not implemented.');
  }
}
