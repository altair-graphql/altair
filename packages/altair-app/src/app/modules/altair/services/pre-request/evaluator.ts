import { debug } from '../../utils/logger';
import { ScriptEvaluatorWorkerFactory } from './evaluator-worker.factory';
import {
  AllScriptEventHandlers,
  getErrorEvent,
  getResponseEvent,
  ScriptEvent,
  ScriptEventData,
  ScriptEventHandlers,
  SCRIPT_INIT_EXECUTE,
} from './events';
import { ScriptContextData } from './helpers';

export class ScriptEvaluator {
  timeout = 1000 * 60 * 5; // 5 minutes
  private worker?: Worker;

  private async getWorker() {
    if (!this.worker) {
      this.worker = await new ScriptEvaluatorWorkerFactory().create();
    }
    return this.worker;
  }

  async executeScript(
    script: string,
    data: ScriptContextData,
    userAvailableHandlers: ScriptEventHandlers
  ): Promise<ScriptContextData> {
    try {
      const worker = await this.getWorker();
      const result = await new Promise<ScriptContextData>((resolve, reject) => {
        // Handle timeout
        const handle = setTimeout(() => {
          this.killWorker();
          reject(new Error('script timeout'));
        }, this.timeout);

        const allHandlers: AllScriptEventHandlers = {
          ...userAvailableHandlers,
          executeComplete: (data: ScriptContextData) => {
            clearTimeout(handle);
            resolve(data);
          },
          scriptError: (err: Error) => {
            clearTimeout(handle);
            reject(err);
          },
        } as const;

        // loop over all the script event handlers and create a listener for each
        // TODO: fn is of any type here. Figure out the typing
        Object.entries(allHandlers).forEach(([key, fn]) => {
          worker.addEventListener(
            'message',
            <T extends ScriptEvent>(e: MessageEvent<ScriptEventData<T>>) => {
              const event = e.data;

              // Handle script events
              if (event.type === key) {
                debug.log(event.type, event);
                // TODO: handle cancelling requests
                const { id, args } = event.payload;
                (async () => {
                  try {
                    const res = await fn(...args);
                    worker.postMessage({
                      type: getResponseEvent(key),
                      payload: { id, response: res },
                    });
                  } catch (err) {
                    worker.postMessage({
                      type: getErrorEvent(key),
                      payload: { id, error: `${(err as any).message ?? err}` },
                    });
                  }
                })();
              }
            }
          );
        });

        worker.onerror = (e) => {
          clearTimeout(handle);
          reject(e);
        };
        worker.postMessage({
          type: SCRIPT_INIT_EXECUTE,
          payload: [script, data],
        });
      });

      return result;
    } finally {
      this.killWorker();
    }
  }

  private killWorker() {
    this.worker?.terminate();
    this.worker = undefined;
  }
}
