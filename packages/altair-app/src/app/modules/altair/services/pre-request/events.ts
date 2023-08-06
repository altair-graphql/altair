import { CookieOptions, ScriptContextData } from './helpers';

export const SCRIPT_EVENTS = {
  INIT_EXECUTE: 'init_execute',
  ALERT: 'alert',
  SCRIPT_ERROR: 'script_error',
  LOG: 'log',
  REQUEST: 'request',
  REQUEST_RESPONSE: 'request_response',
  REQUEST_ERROR: 'request_error',
  EXECUTE_COMPLETE: 'execute_complete',
  SET_COOKIE: 'set_cookie',
  GET_STORAGE_ITEM: 'get_storage_item',
  GET_STORAGE_ITEM_RESPONSE: 'get_storage_item_response',
  GET_STORAGE_ITEM_ERROR: 'get_storage_item_error',
  SET_STORAGE_ITEM: 'set_storage_item',
} as const;

export interface ScriptEventHandlers {
  alert: (msg: string) => void;
  log: (d: unknown) => void;
  request: (arg1: any, arg2: any, arg3: any) => Promise<any>;
  setCookie: (
    key: string,
    value: string,
    options?: CookieOptions
  ) => Promise<void>;
  getStorageItem: (key: string) => Promise<unknown>;
  setStorageItem: (key: string, value: unknown) => Promise<void>;
}

export interface ScriptEventPayloadMap {
  alert: {
    inputs: [string];
  };
  log: {
    inputs: [unknown];
  };
  request: {
    inputs: [any, any, any];
    output: Promise<any>;
  };
  set_cookie: {
    inputs: [string, string, CookieOptions?];
  };
  execute_complete: {
    inputs: [ScriptContextData];
  };
  script_error: {
    inputs: [Error];
  };
  get_storage_item: {
    inputs: [string];
    output: Promise<unknown>;
  };
  set_storage_item: {
    inputs: [string, unknown];
    output: Promise<void>;
  };
}

export type ScriptEvent = keyof ScriptEventPayloadMap;
export interface ScriptEventDataPayload<T extends ScriptEvent> {
  id: string;
  args: ScriptEventPayloadMap[T]['inputs'];
}
export type ScriptEventData<T extends ScriptEvent> = T extends ScriptEvent
  ? { type: T; payload: ScriptEventDataPayload<T> }
  : never;
