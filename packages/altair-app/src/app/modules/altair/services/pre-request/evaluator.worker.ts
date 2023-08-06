import { v4 as uuid } from 'uuid';
import { ScriptEvaluator } from './evaluator';
import { ScriptEventPayloadMap, SCRIPT_EVENTS } from './events';
import { CookieOptions, getGlobalContext, ScriptContextData } from './helpers';

onmessage = async (e) => {
  switch (e.data.type) {
    case SCRIPT_EVENTS.INIT_EXECUTE:
      try {
        await initExecute(e.data.payload);
      } catch (err) {
        makeCall(SCRIPT_EVENTS.SCRIPT_ERROR, err as Error);
      }
      break;
  }
};

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

    const context = {
      altair: getGlobalContext(clonedMutableData, {
        setCookie: async (
          key: string,
          value: string,
          options?: CookieOptions
        ) => {
          makeCall(SCRIPT_EVENTS.SET_COOKIE, key, value, options);
        },
        request: async (arg1, arg2, arg3) => {
          return new Promise((resolve, reject) => {
            const reqId = uuid();
            // TODO: cleanup listener
            addEventListener('message', (e) => {
              switch (e.data.type) {
                case SCRIPT_EVENTS.REQUEST_RESPONSE:
                  if (e.data.payload.id !== reqId) {
                    return;
                  }
                  return resolve(e.data.payload.response);
                case SCRIPT_EVENTS.REQUEST_ERROR:
                  if (e.data.payload.id !== reqId) {
                    return;
                  }
                  return reject(e.data.payload.error);
              }
            });
            self.postMessage({
              type: SCRIPT_EVENTS.REQUEST,
              payload: { id: reqId, args: [arg1, arg2, arg3] },
            });
          });
        },
        getStorageItem: (key: string) => {
          return new Promise((resolve, reject) => {
            const reqId = uuid();
            // TODO: cleanup listener
            addEventListener('message', (e) => {
              switch (e.data.type) {
                case SCRIPT_EVENTS.GET_STORAGE_ITEM_RESPONSE:
                  if (e.data.payload.id !== reqId) {
                    return;
                  }
                  return resolve(e.data.payload.response);
                case SCRIPT_EVENTS.GET_STORAGE_ITEM_ERROR:
                  if (e.data.payload.id !== reqId) {
                    return;
                  }
                  return reject(e.data.payload.error);
              }
            });
            self.postMessage({
              type: SCRIPT_EVENTS.GET_STORAGE_ITEM,
              payload: { id: reqId, args: [key] },
            });
          });
        },
        setStorageItem: async (key: string, value: unknown) => {
          makeCall(SCRIPT_EVENTS.SET_STORAGE_ITEM, key, value);
        },
      }),
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

  makeCall(SCRIPT_EVENTS.EXECUTE_COMPLETE, res);
};

const alert = (msg: string) => makeCall(SCRIPT_EVENTS.ALERT, msg);

const makeCall = <T extends keyof ScriptEventPayloadMap>(
  type: T,
  ...args: ScriptEventPayloadMap[T]['inputs']
) => {
  const id = uuid();
  const event = {
    type,
    payload: { id, args },
  };
  self.postMessage(event);
};
