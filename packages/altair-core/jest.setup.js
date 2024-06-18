/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact
 * order, since "undici" depends on the "TextEncoder" global API.
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

const { TextDecoder, TextEncoder } = require('node:util');
const { ReadableStream, TransformStream } = require('node:stream/web');
const crypto = require('node:crypto');
const { clearImmediate } = require('node:timers');
const { performance } = require('node:perf_hooks');

Object.defineProperties(globalThis, {
  crypto: {
    value: {
      subtle: crypto.webcrypto.subtle,
      getRandomValues(dataBuffer) {
        return crypto.randomFillSync(dataBuffer);
      },
      randomUUID() {
        return crypto.randomUUID();
      },
    },
  },
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  clearImmediate: { value: clearImmediate },
  performance: { value: performance },
});

const { Blob } = require('node:buffer');
const { fetch, Headers, FormData, Request, Response, File } = require('undici');

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Blob: { value: Blob },
  File: { value: File },
  Headers: { value: Headers },
  FormData: { value: FormData },
  Request: { value: Request },
  Response: { value: Response },
});

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
