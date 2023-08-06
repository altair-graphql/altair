import { v4 as uuid } from 'uuid';
import { ScriptEvaluator } from './evaluator';
import {
  AllScriptEventHandlers,
  ScriptEvent,
  ScriptEventParameters,
  SCRIPT_INIT_EXECUTE,
} from './events';
import { getGlobalContext, ScriptContextData } from './helpers';

onmessage = async (e) => {
  switch (e.data.type) {
    case SCRIPT_INIT_EXECUTE:
      try {
        await initExecute(e.data.payload);
      } catch (err) {
        makeCall('scriptError', err as Error);
      }
      break;
  }
};

const workerHandlerNames = [
  'setCookie',
  'request',
  'getStorageItem',
  'setStorageItem',
] as const;
export type WorkerHandlerNames = typeof workerHandlerNames[number];

const initExecute = async (
  payload: Parameters<ScriptEvaluator['executeScript']>
) => {
  const [script, data] = payload;
  const res = await new Promise<ScriptContextData>((resolve, reject) => {
    self.addEventListener('unhandledrejection', (e) => {
      e.preventDefault();
      return reject(e.reason);
    });

    const clonedMutableData: ScriptContextData = JSON.parse(
      JSON.stringify(data)
    );

    // build handlers
    const handlers = workerHandlerNames.reduce(
      <T extends WorkerHandlerNames>(
        acc: Pick<AllScriptEventHandlers, WorkerHandlerNames>,
        key: T
      ) => {
        acc[key] = ((...args: ScriptEventParameters<T>) => {
          return makeCall(key, ...args);
        }) as unknown as AllScriptEventHandlers[T]; // TODO: Look into this typing issue.
        return acc;
      },
      {} as Pick<AllScriptEventHandlers, WorkerHandlerNames>
    );

    const context = {
      altair: getGlobalContext(clonedMutableData, handlers),
      alert,
    };

    const contextEntries = Object.entries(context);
    try {
      const res = function () {
        return eval(`
          (async(${contextEntries.map((e) => e[0]).join(',')}) => {
            ${script};
            return altair.data;
          })(...this.__ctxE.map(e => e[1]));
        `);
      }.call({ __ctxE: contextEntries });
      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });

  makeCall('executeComplete', res);
};

const alert = (msg: string) => makeCall('alert', msg);

const makeCall = <T extends ScriptEvent>(
  type: T,
  ...args: Parameters<AllScriptEventHandlers[T]>
) => {
  return new Promise<ReturnType<AllScriptEventHandlers[T]>>(
    (resolve, reject) => {
      const id = uuid();
      const event = {
        type,
        payload: { id, args },
      };
      // TODO: cleanup listener
      addEventListener('message', (e) => {
        switch (e.data.type) {
          case `${type}_response`:
            if (e.data.payload.id !== id) {
              return;
            }
            return resolve(e.data.payload.response);
          case `${type}_error`:
            if (e.data.payload.id !== id) {
              return;
            }
            return reject(e.data.payload.error);
        }
      });
      self.postMessage(event);
    }
  );
};
