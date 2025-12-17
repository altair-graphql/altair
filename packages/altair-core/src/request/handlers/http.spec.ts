import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { delay } from 'msw';
import { setupServer } from 'msw/node';
import { GraphQLRequestHandler, GraphQLRequestOptions } from '../types';
import { HttpRequestHandler } from './http';
import { Observable } from 'rxjs';
import { MswMockRequestHandler } from '../../test-helpers';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const testObserver = (o: Observable<unknown>) => {
  const values: unknown[] = [];
  let s: any;

  return new Promise<unknown[]>((resolve, reject) => {
    s = o.subscribe({
      next: (value) => {
        values.push(value);
      },
      error: (err) => {
        s.unsubscribe();
        return reject(err);
      },
      complete: () => {
        s.unsubscribe();
        return resolve(values);
      },
    });
  }).finally(() => {
    s?.unsubscribe();
  });
};

describe('HTTP handler', () => {
  it('should properly handle normal successful HTTP requests', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/graphql',
      async () => {
        return Response.json({ data: { hello: 'world' } });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {},
      headers: [
        {
          key: 'X-GraphQL-Token',
          value: 'asd7-237s-2bdk-nsdk4',
        },
      ],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    const receivedRequest = mockHandler.receivedRequest();
    expect(receivedRequest?.url).toEqual('http://localhost:3000/graphql');
    expect(receivedRequest?.headers.get('X-GraphQL-Token')).toEqual(
      'asd7-237s-2bdk-nsdk4'
    );
    expect(await receivedRequest?.json()).toEqual({
      query: 'query { hello }',
      variables: {},
      operationName: 'hello',
    });
    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"world"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/graphql',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle normal successful HTTP GET requests', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/graphql',
      async () => {
        return Response.json({ data: { hello: 'world' } });
      }
    );
    server.use(mockHandler);

    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'GET',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    const receivedRequest = mockHandler.receivedRequest();
    expect(receivedRequest?.url).toEqual(
      'http://localhost:3000/graphql?query=query+%7B+hello+%7D&variables=%7B%7D&operationName=hello'
    );
    expect(receivedRequest?.body).toBeNull();

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"world"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/graphql?query=query+%7B+hello+%7D&variables=%7B%7D&operationName=hello',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should handle requests with file variables', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/graphql',
      async () => {
        return Response.json({ data: { hello: 'world' } });
      }
    );
    server.use(mockHandler);
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
      files: [
        {
          data: new File(['asdfghjkl'], 'test.txt'),
          name: 'myfile',
        },
      ],
      selectedOperation: 'hello',
    };

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    const receivedRequest = mockHandler.receivedRequest();
    expect(receivedRequest?.url).toEqual('http://localhost:3000/graphql');
    const formData = await receivedRequest?.formData();
    expect(formData?.get('operations')).toEqual(
      JSON.stringify({
        query: 'query { hello }',
        variables: { myfile: null },
        operationName: 'hello',
      })
    );
    expect(formData?.get('map')).toEqual(
      JSON.stringify({
        '0': ['variables.myfile'],
      })
    );
    // TODO: figure out why formData.get() returns the file is stringified object `[object File]`
    // expect(formData?.get('0')).toEqual(new File(['asdfghjkl'], 'test.txt'));
    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"world"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/graphql',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle batched requests', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/graphql',
      async () => {
        return Response.json([
          { data: { hello: 'world' } },
          { data: { bye: 'longer' } },
        ]);
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {
        testData: [
          {
            hello: 'world',
          },
          {
            bye: 'longer',
          },
        ],
      },
      headers: [],
      query: 'query a { hello } query b { bye }',
      variables: {},
      selectedOperation: 'hello',
      batchedRequest: true,
    };

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    const receivedRequest = mockHandler.receivedRequest();
    expect(await receivedRequest?.json()).toEqual([
      {
        query: 'query a{hello}',
        variables: {},
        operationName: 'a',
      },
      {
        query: 'query b{bye}',
        variables: {},
        operationName: 'b',
      },
    ]);

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '[{"data":{"hello":"world"}},{"data":{"bye":"longer"}}]',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/graphql',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should handle empty response', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/graphql',
      async () => {
        return new Response(null, { status: 204 });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      additionalParams: {},
      headers: [],
      query: 'query { hello }',
      variables: {},
      selectedOperation: 'hello',
    };

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '',
        headers: expect.any(Object),
        status: 204,
        url: 'http://localhost:3000/graphql',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle normal unsuccessful HTTP GET requests', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/graphql',
      async () => {
        return new Response('my data is not found', {
          status: 404,
        });
      }
    );
    server.use(mockHandler);

    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/graphql',
      method: 'GET',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    const receivedRequest = mockHandler.receivedRequest();
    expect(receivedRequest?.url).toEqual(
      'http://localhost:3000/graphql?query=query+%7B+hello+%7D&variables=%7B%7D&operationName=hello'
    );
    expect(receivedRequest?.body).toBeNull();

    expect(res).toEqual([
      expect.objectContaining({
        ok: false,
        data: 'my data is not found',
        headers: expect.any(Object),
        status: 404,
        url: 'http://localhost:3000/graphql?query=query+%7B+hello+%7D&variables=%7B%7D&operationName=hello',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle failed HTTP requests', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/error',
      async () => {
        return Response.error();
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/error',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();

    expect(testObserver(httpHandler.handle(request))).rejects.toThrow();
  });

  it('should properly handle aborting the request', () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/delay',
      async () => {
        await delay(1000);
        return Response.json({ data: { hello: 'world' } });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/delay',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = httpHandler.handle(request);

    res.subscribe().unsubscribe();
  });

  it('should properly handle streamed responses', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/simple-stream',
      async () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            await delay(10);
            controller.enqueue(encoder.encode('{"data":{"hello":"world"}}'));
            await delay(10);
            controller.enqueue(encoder.encode('{"data":{"bye":"longer"}}'));
            await delay(10);
            controller.enqueue(encoder.encode('{"data":{"rest":"afva"}}'));
            await delay(10);
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/simple-stream',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"world"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/simple-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"data":{"bye":"longer"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/simple-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"data":{"rest":"afva"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/simple-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle streamed responses with errors', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/error-stream',
      async () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            await delay(10);
            controller.enqueue(encoder.encode('{"data":{"hello":"world"}}'));
            await delay(10);
            controller.error('random stream error');
            await delay(10);
            controller.enqueue(encoder.encode('{"data":{"bye":"longer"}}'));
            await delay(10);
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/error-stream',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    try {
      await testObserver(httpHandler.handle(request));
      expect(true).toBe(false); // it should not get here
    } catch (err) {
      expect(err).toBe('random stream error');
    }
  });

  it('should properly handle multipart streamed responses', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/multipart-stream',
      async () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            await delay(10);
            controller.enqueue(
              encoder.encode(
                `---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 108\r\n\r\n{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}\r\n---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}\r\n---`
              )
            );
            await delay(10);
            controller.enqueue(
              encoder.encode(
                '\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true}\r\n---'
              )
            );
            await delay(10);
            controller.enqueue(
              encoder.encode(
                '\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["c"],"path":["alphabet",2]}],"hasNext":true}\r\n---'
              )
            );
            await delay(10);
            controller.enqueue(
              encoder.encode(
                '\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["d"],"path":["alphabet",3]}],"hasNext":true}\r\n---'
              )
            );
            await delay(10);
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'multipart/mixed; boundary=-',
          },
        });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/multipart-stream',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["c"],"path":["alphabet",2]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["d"],"path":["alphabet",3]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  // https://github.com/felipe-gdr/spring-graphql-defer/issues/5
  it('should properly handle multipart streamed responses - sample 2', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/multipart-stream-2',
      async () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            await delay(10);
            // this is invalid since there is no boundary before the first content, so it should be ignored as the preamble as per the spec
            controller.enqueue(
              encoder.encode(
                `\r\ncontent-type: application/json; charset=utf-8\r\n\r\n{"data":{"bookById":{"name":"Effective Java"}},"hasNext":true}\r\n---`
              )
            );
            await delay(10);
            controller.enqueue(
              encoder.encode(
                `\r\ncontent-type: application/json; charset=utf-8\r\n\r\n{"hasNext":true,"incremental":[{"path":["bookById"],"data":{"author":{"firstName":"Joshua"}}}]}\r\n---`
              )
            );
            await delay(10);
            controller.enqueue(
              encoder.encode(
                `content-type: application/json; charset=utf-8\r\n\r\n{"hasNext":false,"incremental":[{"path":[],"data":{"book2":{"name":"Hitchhiker's Guide to the Galaxy"}}}]}\r\n-----`
              )
            );
            await delay(10);
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'content-type': 'multipart/mixed; boundary="-"',
          },
        });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/multipart-stream-2',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(httpHandler.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"hasNext":true,"incremental":[{"path":["bookById"],"data":{"author":{"firstName":"Joshua"}}}]}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream-2',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: `{"hasNext":false,"incremental":[{"path":[],"data":{"book2":{"name":"Hitchhiker's Guide to the Galaxy"}}}]}`,
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream-2',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        responseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle multipart streamed responses with errors', async () => {
    const mockHandler = new MswMockRequestHandler(
      'http://localhost:3000/error-multipart-stream',
      async () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            await delay(10);
            controller.enqueue(
              encoder.encode(
                `---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 108\r\n\r\n{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}\r\n---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}\r\n---`
              )
            );
            await delay(10);
            controller.error('random stream error');
            await delay(10);
            controller.enqueue(
              encoder.encode(
                '\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true}\r\n---'
              )
            );
            await delay(10);
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'multipart/mixed; boundary=-',
          },
        });
      }
    );
    server.use(mockHandler);
    const request: GraphQLRequestOptions = {
      url: 'http://localhost:3000/error-multipart-stream',
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

    const httpHandler: GraphQLRequestHandler = new HttpRequestHandler();
    try {
      await testObserver(httpHandler.handle(request));
      expect(true).toBe(false); // it should not get here
    } catch (err) {
      expect(err).toBe('random stream error');
    }
  });
});
