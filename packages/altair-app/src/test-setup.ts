import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed({
  zoneless: false,
});

import 'core-js/es/reflect';
import 'core-js/proposals/reflect-metadata';
import 'fake-indexeddb/auto';
import crypto from 'crypto';

import jestChrome from 'jest-chrome';
Object.assign(global, jestChrome);
import { TextEncoder, TextDecoder } from 'util';
import { vi } from 'vitest';

Object.assign(global, { TextDecoder, TextEncoder });
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: unknown[]) => crypto.randomBytes(arr.length),
  },
});

vi.mock(
  './app/modules/altair/components/doc-viewer/doc-viewer/worker-helper',
  () => ({
    getDocUtilsWorkerAsyncClass: () => {},
  })
);
vi.mock(
  './app/modules/altair/services/pre-request/evaluator-client.factory',
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
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
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
