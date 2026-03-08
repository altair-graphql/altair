/**
 * @note The block below contains polyfills for Node.js globals
 * required for JSDOM tests. These HAVE to be require's and HAVE
 * to be in this exact order, since "undici" depends on the
 * "TextEncoder" global API.
 */

import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream } from 'node:stream/web';
import { webcrypto, randomFillSync, randomUUID } from 'node:crypto';
import { clearImmediate } from 'node:timers';
import { performance } from 'node:perf_hooks';
import { LocationMock } from '@jedmao/location';
import { Blob, File } from 'node:buffer';

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
  // Using Blob and File from node:buffer since the ones used in undici (used in jsdom)
  // don't seem to implement all the APIs properly, causing issues with tests (await request.formData() never resolves)
  Blob: { value: Blob },
  File: { value: File },

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
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};
