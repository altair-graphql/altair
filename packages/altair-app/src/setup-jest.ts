import 'core-js/es/reflect';
import 'core-js/proposals/reflect-metadata';
import 'jest-preset-angular/setup-jest';
// import 'jest-preset-angular/setup-jest.mjs';
import 'fake-indexeddb/auto';
const crypto = require('crypto');

Object.assign(global, require('jest-chrome'));

Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: unknown[]) => crypto.randomBytes(arr.length),
  },
});
jest.mock(
  './app/modules/altair/components/doc-viewer/doc-viewer/worker-helper',
  () => ({
    getDocUtilsWorkerAsyncClass: () => {},
  })
);
jest.mock(
  './app/modules/altair/services/pre-request/evaluator-worker.factory',
  () => ({
    ScriptEvaluatorWorkerFactory: function () {
      return {
        create: () => {
          return new Worker();
        },
      };
    },
  })
);
class Worker {
  onmessage = (msg: string) => {};
  constructor() {}

  postMessage(msg: string) {
    this.onmessage(msg);
  }
  terminate() {}
  addEventListener() {}
}

/* global mocks for jsdom */
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
});
// Console no-op
Object.defineProperty(window, 'console', {
  value: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
});

Object.defineProperty(window, 'DragEvent', {
  value: class DragEvent {},
});
Object.defineProperty(window, 'EventSource', {
  value: class EventSource {
    url = '';
    constructor(url: string) {
      this.url = url;
    }
    close() {}
  },
});

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    };
  },
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
