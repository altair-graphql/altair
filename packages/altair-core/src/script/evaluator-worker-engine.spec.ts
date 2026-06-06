import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ScriptEvaluatorWorkerEngine } from './evaluator-worker-engine';
import { SCRIPT_INIT_EXECUTE } from './events';
import {
  ScriptContextData,
  ScriptEvaluatorWorker,
  ScriptWorkerMessageData,
  RequestType,
} from './types';

// ---------------------------------------------------------------------------
// Mock worker
// ---------------------------------------------------------------------------

class MockWorker extends ScriptEvaluatorWorker {
  private _messageHandlers: ((e: ScriptWorkerMessageData) => void)[] = [];
  private _errorHandlers: ((err: unknown) => void)[] = [];

  /** Every call to send() is recorded here */
  readonly sentMessages: { type: string; payload: unknown }[] = [];

  /** Override the auto-reply value for a specific message type */
  readonly responseMap: Record<string, unknown> = {};

  /** Message types that will NOT receive an automatic _response reply */
  readonly blockedTypes: Set<string> = new Set();

  onMessage(handler: (e: ScriptWorkerMessageData) => void): void {
    this._messageHandlers.push(handler);
  }

  send(type: string, payload: unknown): void {
    this.sentMessages.push({ type, payload });

    // Automatically reply with a _response message unless the type is blocked
    if (
      !type.endsWith('_response') &&
      !type.endsWith('_error') &&
      !this.blockedTypes.has(type)
    ) {
      const id = (payload as { id: string }).id;
      const response = Object.prototype.hasOwnProperty.call(this.responseMap, type)
        ? this.responseMap[type]
        : undefined;
      this._dispatch(`${type}_response`, { id, response });
    }
  }

  onError(handler: (err: unknown) => void): void {
    this._errorHandlers.push(handler);
  }

  /** Deliver a message to all registered onMessage handlers and flush async work */
  async simulateMessage(type: string, payload: unknown): Promise<void> {
    this._dispatch(type, payload);
    await new Promise((r) => setTimeout(r, 0));
  }

  /** Invoke all registered onError handlers */
  simulateError(err: unknown): void {
    this._errorHandlers.forEach((h) => h(err));
  }

  getSentMessage(type: string): { type: string; payload: unknown } | undefined {
    return this.sentMessages.find((m) => m.type === type);
  }

  getAllSentMessages(type: string): { type: string; payload: unknown }[] {
    return this.sentMessages.filter((m) => m.type === type);
  }

  private _dispatch(type: string, payload: unknown): void {
    [...this._messageHandlers].forEach((h) => h({ type, payload }));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createData = (
  overrides: Partial<ScriptContextData> = {}
): ScriptContextData => ({
  headers: [],
  variables: '{}',
  operationName: 'TestOp',
  query: 'query { test }',
  url: 'https://example.com/graphql',
  environment: {},
  requestScriptLogs: [],
  ...overrides,
});

type ExecuteCompletePayload = { id: string; args: [ScriptContextData] };
type ScriptErrorPayload = { id: string; args: [Error] };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ScriptEvaluatorWorkerEngine', () => {
  let worker: MockWorker;
  let engine: ScriptEvaluatorWorkerEngine;

  beforeEach(() => {
    worker = new MockWorker();
    engine = new ScriptEvaluatorWorkerEngine(worker);
  });

  describe('start()', () => {
    it('registers exactly one onMessage handler on the worker', () => {
      const spy = vi.spyOn(worker, 'onMessage');
      engine.start();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('can be called multiple times without throwing', () => {
      expect(() => {
        engine.start();
        engine.start();
      }).not.toThrow();
    });
  });

  describe('message routing', () => {
    beforeEach(() => engine.start());

    it('does nothing for unknown message types', async () => {
      await worker.simulateMessage('unknown_event', { some: 'data' });

      expect(worker.getSentMessage('executeComplete')).toBeUndefined();
      expect(worker.getSentMessage('scriptError')).toBeUndefined();
    });

    it('triggers script execution for SCRIPT_INIT_EXECUTE messages', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, ['', createData()]);

      expect(worker.getSentMessage('executeComplete')).toBeDefined();
    });
  });

  describe('successful script execution', () => {
    beforeEach(() => engine.start());

    it('sends executeComplete after running an empty script', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, ['', createData()]);

      expect(worker.getSentMessage('executeComplete')).toBeDefined();
    });

    it('sends executeComplete with a non-empty id', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, ['', createData()]);

      const { id } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('reflects mutations the script makes to altair.data in executeComplete', async () => {
      const data = createData({ query: 'original', operationName: 'GetUsers' });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = "updated query";',
        data,
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('updated query');
      // unmutated properties are preserved
      expect(args[0].operationName).toBe('GetUsers');
      // original data is not mutated
      expect(data.query).toBe('original');
    });
  });

  describe('script error handling', () => {
    beforeEach(() => engine.start());

    it('sends scriptError when the script throws an Error', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'throw new Error("oops");',
        createData(),
      ]);

      expect(worker.getSentMessage('scriptError')).toBeDefined();
    });

    it('includes the thrown error instance in the scriptError args', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'throw new Error("test error message");',
        createData(),
      ]);

      const { args } = worker.getSentMessage('scriptError')!
        .payload as ScriptErrorPayload;
      expect(args[0]).toBeInstanceOf(Error);
      expect(args[0].message).toBe('test error message');
    });

    it('does not send executeComplete when the script throws', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'throw new Error("fail");',
        createData(),
      ]);

      expect(worker.getSentMessage('executeComplete')).toBeUndefined();
    });
  });

  describe('active environment update', () => {
    beforeEach(() => engine.start());

    it('passes all environment updated with activeEnvironment=true to updateActiveEnvironment', async () => {
      const data = createData({ environment: {} });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        `
        altair.helpers.setEnvironment("token", "abc123", true);
        altair.helpers.setEnvironment("a", 1);
        altair.helpers.setEnvironment("b", 2, true);
        `,
        data,
      ]);

      const { args } = worker.getSentMessage('updateActiveEnvironment')!.payload as {
        id: string;
        args: [Record<string, unknown>];
      };
      expect(args[0]).toEqual({ token: 'abc123', b: 2 });
      const executeCompleteArgs = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      // The environment in executeComplete should also reflect the updates
      expect(executeCompleteArgs.args[0].environment).toEqual({
        token: 'abc123',
        a: 1,
        b: 2,
      });
    });

    it('does not send updateActiveEnvironment when setEnvironment is called without the flag', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.helpers.setEnvironment("key", "value");',
        createData(),
      ]);

      expect(worker.getSentMessage('updateActiveEnvironment')).toBeUndefined();
    });

    it('sends updateActiveEnvironment before executeComplete', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.helpers.setEnvironment("x", "y", true);',
        createData({ environment: {} }),
      ]);

      const order = worker.sentMessages
        .filter(
          (m) => m.type === 'updateActiveEnvironment' || m.type === 'executeComplete'
        )
        .map((m) => m.type);

      expect(order.indexOf('updateActiveEnvironment')).toBeLessThan(
        order.indexOf('executeComplete')
      );
    });
  });

  describe('worker event handler forwarding (makeCall)', () => {
    beforeEach(() => engine.start());

    it('sends a setCookie message when the script calls helpers.setCookie', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.helpers.setCookie("sid", "val", { path: "/", secure: true });',
        createData(),
      ]);

      const { args } = worker.getSentMessage('setCookie')!.payload as {
        id: string;
        args: [string, string, { path: string; secure: boolean }];
      };
      expect(args[2]).toEqual({ path: '/', secure: true });
    });

    it('sends a request message when the script calls await helpers.request', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.helpers.request("GET", "https://api.example.com", null);',
        createData(),
      ]);

      const msg = worker.getSentMessage('request');
      expect(msg).toBeDefined();
      const { args } = msg!.payload as { id: string; args: [string, string, null] };
      expect(args[0]).toBe('GET');
      expect(args[1]).toBe('https://api.example.com');
      expect(args[2]).toBeNull();
    });

    it('sends a getStorageItem message when the script calls await altair.storage.get', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.storage.get("myKey");',
        createData(),
      ]);

      const msg = worker.getSentMessage('getStorageItem');
      expect(msg).toBeDefined();
      const { args } = msg!.payload as { id: string; args: [string] };
      expect(args[0]).toBe('myKey');
    });

    it('sends a setStorageItem message when the script calls await altair.storage.set', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.storage.set("myKey", { value: 42 });',
        createData(),
      ]);

      const msg = worker.getSentMessage('setStorageItem');
      expect(msg).toBeDefined();
      const { args } = msg!.payload as {
        id: string;
        args: [string, { value: number }];
      };
      expect(args[0]).toBe('myKey');
      expect(args[1]).toEqual({ value: 42 });
    });

    it('sends an alert message when the script calls alert()', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'alert("hello world");',
        createData(),
      ]);

      const msg = worker.getSentMessage('alert');
      expect(msg).toBeDefined();
      const { args } = msg!.payload as { id: string; args: [string] };
      expect(args[0]).toBe('hello world');
    });

    it('includes a unique id in every makeCall payload', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.storage.get("k1"); await altair.storage.get("k2");',
        createData(),
      ]);

      const msgs = worker.getAllSentMessages('getStorageItem');
      expect(msgs).toHaveLength(2);
      const ids = msgs.map((m) => (m.payload as { id: string }).id);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  describe('handler response propagation', () => {
    beforeEach(() => engine.start());

    it('makes the request handler response available in the script', async () => {
      worker.responseMap['request'] = { status: 200, body: '{"ok":true}' };

      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        `
        const res = await altair.helpers.request('GET', 'https://api.example.com', null);
        altair.data.variables = JSON.stringify(res);
        `,
        createData(),
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(JSON.parse(args[0].variables)).toEqual({
        status: 200,
        body: '{"ok":true}',
      });
    });

    it('makes the getStorageItem handler response available in the script', async () => {
      worker.responseMap['getStorageItem'] = 'stored-value';

      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        `
        const val = await altair.storage.get('someKey');
        altair.data.variables = JSON.stringify(val);
        `,
        createData(),
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(JSON.parse(args[0].variables)).toBe('stored-value');
    });
  });

  describe('script context features', () => {
    beforeEach(() => engine.start());

    it('exposes environment variables via altair.helpers.getEnvironment', async () => {
      const data = createData({ environment: { apiKey: 'secret-123' } });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = altair.helpers.getEnvironment("apiKey");',
        data,
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('secret-123');
    });

    it('exposes nested environment variables using dot notation', async () => {
      const data = createData({ environment: { user: { name: 'Alice' } } });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = altair.helpers.getEnvironment("user.name");',
        data,
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('Alice');
    });

    it('exposes cookie values via altair.helpers.getCookie', async () => {
      const data = createData({ __cookieJar: { sessionId: 'abc-xyz' } });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = altair.helpers.getCookie("sessionId");',
        data,
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('abc-xyz');
    });

    it('appends a log entry to requestScriptLogs when altair.log is called', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.log("hello from script");',
        createData(),
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].requestScriptLogs).toHaveLength(1);
      expect(args[0].requestScriptLogs?.[0]?.text).toBe('"hello from script"');
    });

    it('serializes complex log values as JSON', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.log({ count: 3, items: ["a", "b"] });',
        createData(),
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(JSON.parse(args[0]!.requestScriptLogs![0]!.text!)).toEqual({
        count: 3,
        items: ['a', 'b'],
      });
    });

    it('exposes altair.response when response data is present in the context', async () => {
      const data = createData({
        requestType: RequestType.QUERY,
        response: {
          ok: true,
          body: '{"data":{"users":[]}}',
          headers: { 'content-type': 'application/json' },
          status: 200,
          statusText: 'OK',
          url: 'https://example.com/graphql',
          requestStartTime: 0,
          requestEndTime: 100,
          responseTime: 100,
        },
      });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = altair.response ? "has-response" : "no-response";',
        data,
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('has-response');
    });

    it('exposes the correct status code via altair.response.statusCode', async () => {
      const data = createData({
        requestType: RequestType.QUERY,
        response: {
          ok: true,
          body: '',
          headers: {},
          status: 201,
          statusText: 'Created',
          url: 'https://example.com/graphql',
          requestStartTime: 0,
          requestEndTime: 50,
          responseTime: 50,
        },
      });
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = String(altair.response.statusCode);',
        data,
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('201');
    });

    it('altair.response is undefined when no response data is provided', async () => {
      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'altair.data.query = altair.response ? "has-response" : "no-response";',
        createData(),
      ]);

      const { args } = worker.getSentMessage('executeComplete')!
        .payload as ExecuteCompletePayload;
      expect(args[0].query).toBe('no-response');
    });
  });

  describe('worker error handling', () => {
    beforeEach(() => engine.start());

    it('sends scriptError when the worker emits an error during execution', async () => {
      // Block request auto-reply so the script suspends at the await
      worker.blockedTypes.add('request');

      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.helpers.request("GET", "https://api.example.com", null);',
        createData(),
      ]);

      // The error handler inside initExecute is registered synchronously
      // before the first await, so we can fire it immediately after the flush
      worker.simulateError(new Error('worker crashed'));
      await new Promise((r) => setTimeout(r, 0));

      expect(worker.getSentMessage('scriptError')).toBeDefined();
    });

    it('includes the worker error in the scriptError args', async () => {
      worker.blockedTypes.add('request');

      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.helpers.request("GET", "https://api.example.com", null);',
        createData(),
      ]);

      worker.simulateError(new Error('connection lost'));
      await new Promise((r) => setTimeout(r, 0));

      const { args } = worker.getSentMessage('scriptError')!
        .payload as ScriptErrorPayload;
      expect((args[0] as unknown as Error).message).toBe('connection lost');
    });

    it('does not send executeComplete when a worker error occurs', async () => {
      worker.blockedTypes.add('request');

      await worker.simulateMessage(SCRIPT_INIT_EXECUTE, [
        'await altair.helpers.request("GET", "https://api.example.com", null);',
        createData(),
      ]);

      worker.simulateError(new Error('crashed'));
      await new Promise((r) => setTimeout(r, 0));

      expect(worker.getSentMessage('executeComplete')).toBeUndefined();
    });
  });
});
