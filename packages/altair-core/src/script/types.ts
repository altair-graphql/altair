import type { HttpResponse } from '@angular/common/http';
import { IDictionary } from '../types/shared';
import { IEnvironment } from '../types/state/environments.interfaces';
import { HeaderState } from '../types/state/header.interfaces';
import { LogLine } from '../types/state/query.interfaces';
import { getErrorEvent, getResponseEvent } from './events';

export interface SendRequestResponse {
  ok: boolean;
  body: string;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  url: string;
  requestStartTime: number;
  requestEndTime: number;
  responseTime: number;
}

export enum RequestType {
  INTROSPECTION = 'introspection',
  QUERY = 'query',
  SUBSCRIPTION = 'subscription',
}

export interface ScriptContextHelpers {
  getEnvironment: (key: string) => unknown;
  setEnvironment: (key: string, value: unknown, activeEnvironment?: boolean) => void;
  getCookie: (key: string) => string;
  setCookie: (key: string, value: string) => void;
  request: (
    arg1: unknown,
    arg2: unknown,
    arg3: unknown
  ) => Promise<ArrayBuffer | null>;
}

export interface ScriptContextStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
}

export interface ScriptContextData {
  headers: HeaderState;
  variables: string;
  operationName: string;
  query: string;
  environment: IDictionary;
  url: string;
  requestExtensions?: string;
  requestScriptLogs?: LogLine[];
  response?: SendRequestResponse;
  requestType?: RequestType;
  __toSetActiveEnvironment?: IDictionary;
  __cookieJar?: IDictionary;
}

export interface ScriptContextResponse {
  requestType: RequestType;
  responseTime: number;
  statusCode: number;
  body: unknown;
  headers: IDictionary;
}
export interface GlobalHelperContext {
  data: ScriptContextData;
  helpers: ScriptContextHelpers;
  storage: ScriptContextStorage;
  importModule: (moduleName: string) => unknown;
  log: (d: unknown) => void;
  response?: ScriptContextResponse;
}

export interface ScriptTranformResult {
  requestScriptLogs: LogLine[];
  additionalHeaders: HeaderState;
  environment?: IEnvironment;
}

export type SameSite = 'Lax' | 'None' | 'Strict';
export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: SameSite;
}

export interface GlobalContextBuilderHandlers {
  setCookie: ScriptEventHandlers['setCookie'];
  request: ScriptEventHandlers['request'];
  getStorageItem: ScriptEventHandlers['getStorageItem'];
  setStorageItem: ScriptEventHandlers['setStorageItem'];
}

export interface ModuleImportsMap {
  [name: string]: { exec: () => Promise<unknown> };
}

export interface ScriptEventHandlers {
  alert: (msg: string) => Promise<void>;
  log: (d: unknown) => Promise<void>;
  request: (arg1: unknown, arg2: unknown, arg3: unknown) => Promise<unknown>;
  setCookie: (key: string, value: string, options?: CookieOptions) => Promise<void>;
  getStorageItem: (key: string) => Promise<unknown>;
  setStorageItem: (key: string, value: unknown) => Promise<void>;
  updateActiveEnvironment: (
    environmentData: Record<string, unknown>
  ) => Promise<void>;
}

// Extended event handler interface to include internal native events like scriptError as well
export interface AllScriptEventHandlers extends ScriptEventHandlers {
  executeComplete: (data: ScriptContextData) => void;
  scriptError: (err: Error) => void;
}

export type ScriptEvent = keyof AllScriptEventHandlers;
export type ScriptResponseEvent<T extends string> = `${T}_response`;
export type ScriptEventParameters<T extends ScriptEvent> = Parameters<
  AllScriptEventHandlers[T]
>;
export interface ScriptEventDataPayload<T extends ScriptEvent> {
  id: string;
  args: ScriptEventParameters<T>;
}
export interface ScriptEventResponsePayload {
  id: string;
  response: any; // TODO: Define the response type from the AllScriptEventHandlers
}
export interface ScriptEventErrorPayload {
  id: string;
  error: string;
}
export type ScriptEventData<T extends ScriptEvent> = T extends ScriptEvent
  ? { type: T; payload: ScriptEventDataPayload<T> }
  : never;

export interface ScriptWorkerMessageData {
  type: string;
  payload: any;
}

export interface ScriptEvaluatorClientFactory {
  create: () => Promise<ScriptEvaluatorClient>;
}
export abstract class ScriptEvaluatorClient {
  abstract subscribe<T extends ScriptEvent>(
    type: T,
    handler: (type: T, e: ScriptEventData<T>) => void
  ): void;
  abstract send(type: string, payload: any): void;
  abstract onError(handler: (err: any) => void): void;
  abstract destroy(): void;

  sendResponse<T extends ScriptEvent>(type: T, payload: ScriptEventResponsePayload) {
    this.send(getResponseEvent(type), payload);
  }

  sendError<T extends ScriptEvent>(type: T, payload: ScriptEventErrorPayload) {
    this.send(getErrorEvent(type), payload);
  }
}

export abstract class ScriptEvaluatorWorker {
  abstract onMessage(handler: (e: ScriptWorkerMessageData) => void): void;
  abstract send(type: string, payload: any): void;
  abstract onError(handler: (err: any) => void): void;
}
