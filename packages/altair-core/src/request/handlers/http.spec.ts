import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { GraphQLRequestOptions } from '../types';
import { HttpRequestHandler } from './http';

const server = setupServer(
  http.post('http://localhost:3000/graphql', () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Encode the string chunks using "TextEncoder".
        controller.enqueue(encoder.encode('Brand'));
        // controller.enqueue(encoder.encode('New'));
        // controller.enqueue(encoder.encode('World'));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain' },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HTTP handler', () => {
  // for some reason the readable stream is not returning done as true so we never get to the end of the stream
  it.skip('should properly handle normal successful HTTP requests', () => {
    // Test code here
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

    const http = new HttpRequestHandler();
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };
    http.handle(request).subscribe(observer);

    expect(observer.next).toHaveBeenCalledWith({});
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
  });
});
