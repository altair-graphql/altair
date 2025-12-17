import { describe, expect, it, vi } from 'vitest';
import {
  SubscriptionProvider,
  SubscriptionProviderExecuteOptions,
  SubscriptionProviderExtraOptions,
} from '../subscriptions/subscription-provider';
import { Observable, from, map } from 'rxjs';
import { SubscriptionProviderRequestHandlerAdapter } from './adapters';
import { GraphQLRequestOptions } from './types';

class TestSubscriptionProvider extends SubscriptionProvider {
  constructor(
    subscriptionUrl: string,
    connectionParams: Record<string, unknown>,
    extraOptions?: SubscriptionProviderExtraOptions
  ) {
    super(subscriptionUrl, connectionParams, extraOptions);
  }
  execute = vi.fn(
    (options: SubscriptionProviderExecuteOptions): Observable<unknown> => {
      return from(this.connectionParams.testData).pipe(
        map((data) => {
          if (data instanceof Error) {
            throw data;
          }
          return data;
        })
      );
    }
  );
  close = vi.fn(() => {});
}
describe('SubscriptionProviderRequestHandlerAdapter', () => {
  it('should properly transform a SubscriptionProvider to a GraphQLRequestHandler - single response', () => {
    const adapter = new SubscriptionProviderRequestHandlerAdapter(
      TestSubscriptionProvider
    );
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {
        testData: [
          {
            hello: 'world',
          },
        ],
      },
      headers: [],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };
    const response = {
      data: '{"hello":"world"}',
      headers: new Headers(),
      ok: true,
      requestEndTimestamp: expect.any(Number),
      requestStartTimestamp: expect.any(Number),
      responseTimeMs: expect.any(Number),
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/graphql',
    };
    const observer = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };
    adapter.handle(request).subscribe(observer);
    expect(observer.next).toHaveBeenCalledWith(response);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
  });

  it('should properly transform a SubscriptionProvider to a GraphQLRequestHandler - multiple responses', () => {
    const adapter = new SubscriptionProviderRequestHandlerAdapter(
      TestSubscriptionProvider
    );
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {
        testData: [
          {
            hello: 'world',
          },
          {
            hello: 'world2',
          },
        ],
      },
      headers: [],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };
    const response = {
      data: '{"hello":"world"}',
      headers: new Headers(),
      ok: true,
      requestEndTimestamp: expect.any(Number),
      requestStartTimestamp: expect.any(Number),
      responseTimeMs: expect.any(Number),
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/graphql',
    };
    const response2 = {
      data: '{"hello":"world2"}',
      headers: new Headers(),
      ok: true,
      requestEndTimestamp: expect.any(Number),
      requestStartTimestamp: expect.any(Number),
      responseTimeMs: expect.any(Number),
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/graphql',
    };
    const observer = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };
    adapter.handle(request).subscribe(observer);
    expect(observer.next).toHaveBeenNthCalledWith(1, response);
    expect(observer.next).toHaveBeenNthCalledWith(2, response2);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
  });

  it('should properly transform a SubscriptionProvider to a GraphQLRequestHandler - error', () => {
    const adapter = new SubscriptionProviderRequestHandlerAdapter(
      TestSubscriptionProvider
    );
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {
        testData: [
          {
            hello: 'world',
          },
          new Error('Test error'),
          {
            hello: 'world2',
          },
        ],
      },
      headers: [],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };

    const response = {
      data: '{"hello":"world"}',
      headers: new Headers(),
      ok: true,
      requestEndTimestamp: expect.any(Number),
      requestStartTimestamp: expect.any(Number),
      responseTimeMs: expect.any(Number),
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/graphql',
    };
    const observer = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };
    adapter.handle(request).subscribe(observer);
    expect(observer.next).toHaveBeenCalledTimes(1); // Only the response before the error should be emitted
    expect(observer.next).toHaveBeenCalledWith(response);
    expect(observer.error).toHaveBeenCalledWith(new Error('Test error'));
    expect(observer.complete).not.toHaveBeenCalled();
  });
  it('should call close on the provider when unsubscribed', () => {
    const adapter = new SubscriptionProviderRequestHandlerAdapter(
      TestSubscriptionProvider
    );
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {
        testData: [
          {
            hello: 'world',
          },
        ],
      },
      headers: [],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };
    const observer = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };
    const subscription = adapter.handle(request).subscribe(observer);
    subscription.unsubscribe();
    expect(adapter.provider?.close).toHaveBeenCalled();
  });

  it('should call the execute method on the provider with the correct options', () => {
    const adapter = new SubscriptionProviderRequestHandlerAdapter(
      TestSubscriptionProvider
    );
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {
        testData: [
          {
            hello: 'world',
          },
        ],
      },
      headers: [],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };
    const observer = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };
    adapter.handle(request).subscribe(observer);
    expect(adapter.provider?.execute).toHaveBeenCalledWith({
      query: 'query { hello }',
      variables: {},
      operationName: 'hello',
    });
  });
});
