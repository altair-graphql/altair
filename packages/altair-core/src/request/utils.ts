import { Observer, Subscriber } from 'rxjs';
import { GraphQLResponseData } from './types';

export const simpleResponseObserver = (
  subscriber: Subscriber<GraphQLResponseData>,
  url: string,
  requestStartTimestamp: number
): Observer<unknown> => {
  return {
    next: (res) => {
      const requestEndTimestamp = Date.now();

      subscriber.next({
        ok: true,
        data: JSON.stringify(res),
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
        url: url,
        requestStartTimestamp,
        requestEndTimestamp,
        responseTimeMs: requestEndTimestamp - requestStartTimestamp,
      });
    },
    error: (...args) => subscriber.error(...args),
    complete: () => subscriber.complete(),
  };
};
