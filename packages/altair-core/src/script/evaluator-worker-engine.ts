import { v4 as uuid } from 'uuid';
import { ScriptEvaluatorClientEngine } from './evaluator-client-engine';
import { SCRIPT_INIT_EXECUTE } from './events';
import {
  AllScriptEventHandlers,
  GlobalHelperContext,
  ScriptContextData,
  ScriptEvaluatorWorker,
  ScriptEvent,
  ScriptEventParameters,
} from './types';
import { getGlobalContext } from './context';

const workerHandlerNames = [
  'setCookie',
  'request',
  'getStorageItem',
  'setStorageItem',
] as const;
export type WorkerHandlerNames = (typeof workerHandlerNames)[number];

export class ScriptEvaluatorWorkerEngine {
  constructor(private worker: ScriptEvaluatorWorker) {}

  start() {
    this.worker.onMessage(async (e) => {
      switch (e.type) {
        case SCRIPT_INIT_EXECUTE:
          try {
            await this.initExecute(e.payload);
          } catch (err) {
            await this.makeCall('scriptError', err as Error);
          }
          break;
      }
    });
  }

  private async initExecute(
    payload: Parameters<ScriptEvaluatorClientEngine['executeScript']>
  ) {
    const [script, data] = payload;
    const res = await new Promise<ScriptContextData>((resolve, reject) => {
      this.worker.onError((err) => {
        reject(err);
      });

      const clonedMutableData: ScriptContextData = JSON.parse(JSON.stringify(data));

      // build handlers
      const handlers = workerHandlerNames.reduce(
        <T extends WorkerHandlerNames>(
          acc: Pick<AllScriptEventHandlers, WorkerHandlerNames>,
          key: T
        ) => {
          acc[key] = ((...args: ScriptEventParameters<T>) => {
            return this.makeCall(key, ...args);
          }) as unknown as AllScriptEventHandlers[T]; // TODO: Look into this typing issue.
          return acc;
        },
        {} as Pick<AllScriptEventHandlers, WorkerHandlerNames>
      );

      const context = {
        altair: getGlobalContext(clonedMutableData, handlers),
        alert: (msg: string) => this.makeCall('alert', msg),
      };

      try {
        return this.evalWithContext(script, context).then((result) => {
          return resolve(result);
        });
      } catch (e) {
        return reject(e);
      }
    });

    if (res.__toSetActiveEnvironment) {
      // update active environment
      this.makeCall('updateActiveEnvironment', res.__toSetActiveEnvironment);
    }
    this.makeCall('executeComplete', res);
  }

  private makeCall<T extends ScriptEvent>(
    type: T,
    ...args: Parameters<AllScriptEventHandlers[T]>
  ) {
    return new Promise<ReturnType<AllScriptEventHandlers[T]>>((resolve, reject) => {
      const id = uuid();
      // TODO: cleanup listener
      this.worker.onMessage((e) => {
        switch (e.type) {
          case `${type}_response`:
            if (e.payload.id !== id) {
              return;
            }
            return resolve(e.payload.response);
          case `${type}_error`:
            if (e.payload.id !== id) {
              return;
            }
            return reject(e.payload.error);
        }
      });
      this.worker.send(type, { id, args });
    });
  }

  private async evalWithContext(
    script: string,
    context: {
      altair: GlobalHelperContext;
      alert: (msg: string) => Promise<Promise<void>>;
    }
  ) {
    const contextEntries = Object.entries(context);
    const fn = (0, eval)(`
      async (${contextEntries.map((e) => e[0]).join(',')}) => {
        ${script};
        return altair.data;
      }
    `);
    return fn(...contextEntries.map((e) => e[1]));
  }
}
