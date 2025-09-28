import {
  CookieOptions,
  GlobalContextBuilderHandlers,
  GlobalHelperContext,
  ModuleImportsMap,
  RequestType,
  ScriptContextData,
  ScriptContextResponse,
} from './types';
import { get, set } from 'object-path';

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
      body: data.response.body,
      requestType: data.requestType ?? RequestType.QUERY,
      responseTime: data.response.responseTime,
      statusCode: data.response.status,
      headers: data.response.headers,
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
        // Support nested environment variable access using dot notation (e.g., 'user.name')
        return get(data.environment, key);
      },
      /**
       * @param key environment key (supports nested paths using dot notation, e.g., 'user.name')
       * @param val value to set
       * @param activeEnvironment if the value should be replaced in the currently active environment after execution
       */
      setEnvironment: (key: string, val: unknown, activeEnvironment = false) => {
        // Support nested environment variable setting using dot notation (e.g., 'user.name')
        set(data.environment, key, val);
        if (activeEnvironment) {
          data.__toSetActiveEnvironment = data.__toSetActiveEnvironment ?? {};
          set(data.__toSetActiveEnvironment, key, val);
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
        id: crypto.randomUUID(),
        time: Date.now(),
        text: JSON.stringify(d, null, 2),
        source: 'Request script',
      });
    },
  };
};
