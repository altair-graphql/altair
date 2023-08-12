import { CookieOptions, ScriptContextData } from './helpers';

export const SCRIPT_INIT_EXECUTE = 'init_execute';

export const getResponseEvent = (type: string) => `${type}_response`;
export const getErrorEvent = (type: string) => `${type}_error`;

export interface ScriptEventHandlers {
  alert: (msg: string) => Promise<void>;
  log: (d: unknown) => Promise<void>;
  request: (arg1: any, arg2: any, arg3: any) => Promise<any>;
  setCookie: (
    key: string,
    value: string,
    options?: CookieOptions
  ) => Promise<void>;
  getStorageItem: (key: string) => Promise<unknown>;
  setStorageItem: (key: string, value: unknown) => Promise<void>;
}

// Extended event handler interface to include internal native events like scriptError as well
export interface AllScriptEventHandlers extends ScriptEventHandlers {
  executeComplete: (data: ScriptContextData) => void;
  scriptError: (err: Error) => void;
}

export type ScriptEvent = keyof AllScriptEventHandlers;
export type ScriptEventParameters<T extends ScriptEvent> = Parameters<
  AllScriptEventHandlers[T]
>;
export interface ScriptEventDataPayload<T extends ScriptEvent> {
  id: string;
  args: ScriptEventParameters<T>;
}
export type ScriptEventData<T extends ScriptEvent> = T extends ScriptEvent
  ? { type: T; payload: ScriptEventDataPayload<T> }
  : never;
