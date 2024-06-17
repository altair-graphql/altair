import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpResponse, http, delay } from 'msw';
import { setupServer } from 'msw/node';
import { GraphQLRequestHandler, GraphQLRequestOptions } from '../types';
import { HttpRequestHandler } from './http';
import { Observable } from 'rxjs';
import { QueryResponse } from '../../types/state/query.interfaces';

const server = setupServer(
  http.post('http://localhost:3000/graphql', () => {
    return Response.json({ data: { hello: 'world' } });
  }),
  http.post('http://localhost:3000/error', () => {
    return Response.error();
  }),
  http.post('http://localhost:3000/delay', async () => {
    await delay(1000);
    return Response.json({ data: { hello: 'world' } });
  }),
  http.post('http://localhost:3000/simple-stream', async () => {
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
  }),
  http.post('http://localhost:3000/error-stream', async () => {
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
  }),
  http.post('http://localhost:3000/multipart-stream', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        await delay(10);
        controller.enqueue(
          encoder.encode(
            `---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 108\r\n\r\n{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}\r\n---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}\r\n---\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 70\r\n\r\n{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true}\r\n---`
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
  })
);

beforeAll(() => server.listen());
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

    const http: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(http.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"world"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/graphql',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle failed HTTP requests', async () => {
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

    const http: GraphQLRequestHandler = new HttpRequestHandler();

    expect(testObserver(http.handle(request))).rejects.toThrow();
  });

  it('should properly handle aborting the request', () => {
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

    const http: GraphQLRequestHandler = new HttpRequestHandler();
    const res = http.handle(request);

    res.subscribe().unsubscribe();
  });

  it('should properly handle streamed responses', async () => {
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

    const http: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(http.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"world"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/simple-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"data":{"bye":"longer"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/simple-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"data":{"rest":"afva"}}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/simple-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
    ]);
  });

  it('should properly handle streamed responses with errors', async () => {
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

    const http: GraphQLRequestHandler = new HttpRequestHandler();
    try {
      await testObserver(http.handle(request));
      expect(true).toBe(false); // it should not get here
    } catch (err) {
      expect(err).toBe('random stream error');
    }
  });

  it('should properly handle multipart streamed responses', async () => {
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

    const http: GraphQLRequestHandler = new HttpRequestHandler();
    const res = await testObserver(http.handle(request));

    expect(res).toEqual([
      expect.objectContaining({
        ok: true,
        data: '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["c"],"path":["alphabet",2]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
      expect.objectContaining({
        ok: true,
        data: '{"incremental":[{"items":["d"],"path":["alphabet",3]}],"hasNext":true}',
        headers: expect.any(Object),
        status: 200,
        url: 'http://localhost:3000/multipart-stream',
        requestStartTimestamp: expect.any(Number),
        requestEndTimestamp: expect.any(Number),
        resopnseTimeMs: expect.any(Number),
      }),
    ]);
  });
});
