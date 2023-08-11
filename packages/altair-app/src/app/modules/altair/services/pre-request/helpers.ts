import type { IDictionary } from 'altair-graphql-core/build/types/shared';
import type { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import type { LogLine } from 'altair-graphql-core/build/types/state/query.interfaces';
import type { SendRequestResponse } from '../gql/gql.service';
import { ScriptEventHandlers } from './events';

export enum RequestType {
  INTROSPECTION = 'introspection',
  QUERY = 'query',
  SUBSCRIPTION = 'subscription',
}
export interface ScriptContextHelpers {
  getEnvironment: (key: string) => any;
  setEnvironment: (key: string, value: any) => void;
  getCookie: (key: string) => string;
  setCookie: (key: string, value: string) => void;
  request: (arg1: any, arg2: any, arg3: any) => Promise<ArrayBuffer | null>;
}
export interface ScriptContextStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
}

export interface ScriptContextData {
  headers: HeaderState;
  variables: string;
  query: string;
  environment: IDictionary;
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
  importModule: (moduleName: string) => any;
  log: (d: unknown) => void;
  response?: ScriptContextResponse;
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
  [name: string]: { exec: () => Promise<any> };
}

export const ModuleImports: ModuleImportsMap = {
  atob: {
    async exec() {
      return (await import('abab')).atob;
    },
  },
  btoa: {
    async exec() {
      return (await import('abab')).btoa;
    },
  },
  'crypto-js': {
    async exec() {
      return (await import('crypto-js')).default;
    },
  },
};

export const buildContextResponse = (
  data: ScriptContextData
): ScriptContextResponse | undefined => {
  if (data.response) {
    return {
      body: data.response.response.body,
      requestType: data.requestType || RequestType.QUERY,
      responseTime: data.response.meta.responseTime,
      statusCode: data.response.response.status,
      headers: data.response.meta.headers,
    };
  }
};

export const importModuleHelper = async (moduleName: string) => {
  const mod = ModuleImports[moduleName];
  if (!mod) {
    throw new Error(`No request script module found matching "${moduleName}"`);
  }

  return mod.exec();
};

export const getGlobalContext = (
  data: ScriptContextData,
  handlers: GlobalContextBuilderHandlers
): GlobalHelperContext => {
  return {
    data,
    helpers: {
      getEnvironment: (key: string) => {
        return data.environment[key];
      },
      /**
       * @param key environment key
       * @param val value to set
       * @param activeEnvironment if the value should be replaced in the currently active environment after execution
       */
      setEnvironment: (
        key: string,
        val: unknown,
        activeEnvironment = false
      ) => {
        data.environment[key] = val;
        if (activeEnvironment) {
          data.__toSetActiveEnvironment = data.__toSetActiveEnvironment ?? {};
          data.__toSetActiveEnvironment[key] = val;
        }
      },
      getCookie: (key: string) => {
        return data.__cookieJar?.[key] ?? '';
      },
      setCookie: (key: string, value: string, options?: CookieOptions) => {
        handlers.setCookie(key, value, options);
      },
      request: async (arg1, arg2, arg3) => {
        return handlers.request(arg1, arg2, arg3);
      },
    },
    storage: {
      get: (key: string) => {
        return handlers.getStorageItem(key);
      },
      set: (key: string, value: unknown) => {
        return handlers.setStorageItem(key, value);
      },
    },
    importModule: (moduleName: string) => importModuleHelper(moduleName),
    response: buildContextResponse(data),
    log: (d) => {
      data.requestScriptLogs = data.requestScriptLogs ?? [];
      data.requestScriptLogs.push({
        time: Date.now(),
        text: JSON.stringify(d, null, 2),
        source: 'Request script',
      });
    },
  };
};
