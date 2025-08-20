import { ScriptEvent, ScriptResponseEvent } from './types';

export const SCRIPT_INIT_EXECUTE = 'init_execute';
export const SCRIPT_READY = 'ready';

export const getResponseEvent = <T extends string>(
  type: T
): ScriptResponseEvent<T> => `${type}_response`;
export const getErrorEvent = (type: string) => `${type}_error`;
