/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact
 * order, since "undici" depends on the "TextEncoder" global API.
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream } from 'node:stream/web';
import { webcrypto, randomFillSync, randomUUID } from 'node:crypto';
import { clearImmediate } from 'node:timers';
import { performance } from 'node:perf_hooks';
import { LocationMock } from '@jedmao/location';

Object.defineProperties(globalThis, {
  crypto: {
    value: {
      subtle: webcrypto.subtle,
      getRandomValues(dataBuffer: DataView) {
        return randomFillSync(dataBuffer);
      },
      randomUUID() {
        return randomUUID();
      },
    },
  },
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  clearImmediate: { value: clearImmediate },
  performance: { value: performance },
});

Object.defineProperties(globalThis, {
  // Mock the location object
  location: {
    value: new LocationMock('http://test.com'),
  },
});

global.structuredClone = (data) => {
  return JSON.parse(JSON.stringify(data));
};

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
