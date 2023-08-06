import { debug } from '../../utils/logger';
import {
  ScriptEvent,
  ScriptEventData,
  ScriptEventHandlers,
  SCRIPT_EVENTS,
} from './events';
import { ScriptContextData } from './helpers';

export class ScriptEvaluator {
  timeout = 1000 * 60 * 5; // 5 minutes
  private worker?: Worker;

  private getWorker() {
    if (!this.worker) {
      this.worker = new Worker(new URL('./evaluator.worker', import.meta.url));
    }
    return this.worker;
  }

  async executeScript(
    script: string,
    data: ScriptContextData,
    handlers: ScriptEventHandlers
  ): Promise<ScriptContextData> {
    try {
      const worker = this.getWorker();
      const result = await new Promise<ScriptContextData>((resolve, reject) => {
        // Handle timeout
        const handle = setTimeout(() => {
          this.killWorker();
          reject(new Error('script timeout'));
        }, this.timeout);

        worker.onmessage = async <T extends ScriptEvent>(
          e: MessageEvent<ScriptEventData<T>>
        ) => {
          clearTimeout(handle);

          const event = e.data;
          debug.log(event.type, event);

          // Handle script events
          switch (event.type) {
            case SCRIPT_EVENTS.SCRIPT_ERROR:
              this.killWorker();
              reject(event.payload.args[0]);
              break;
            case SCRIPT_EVENTS.ALERT:
              handlers.alert(...event.payload.args);
              break;
            case SCRIPT_EVENTS.LOG:
              handlers.log(...event.payload.args);
              break;
            case SCRIPT_EVENTS.REQUEST: {
              // TODO: handle cancelling requests
              const { id, args } = event.payload;
              try {
                const res = await handlers.request(...args);
                worker.postMessage({
                  type: SCRIPT_EVENTS.REQUEST_RESPONSE,
                  payload: { id, response: res },
                });
              } catch (err) {
                worker.postMessage({
                  type: SCRIPT_EVENTS.REQUEST_ERROR,
                  payload: { id, error: err },
                });
              }
              break;
            }
            case SCRIPT_EVENTS.SET_COOKIE:
              handlers.setCookie(...event.payload.args);
              break;
            case SCRIPT_EVENTS.GET_STORAGE_ITEM: {
              // TODO: handle cancelling requests
              const { id, args } = event.payload;
              try {
                const res = await handlers.getStorageItem(...args);
                worker.postMessage({
                  type: SCRIPT_EVENTS.GET_STORAGE_ITEM_RESPONSE,
                  payload: { id, response: res },
                });
              } catch (err) {
                worker.postMessage({
                  type: SCRIPT_EVENTS.GET_STORAGE_ITEM_ERROR,
                  payload: { id, error: err },
                });
              }
              break;
            }
            case SCRIPT_EVENTS.SET_STORAGE_ITEM:
              handlers.setStorageItem(...event.payload.args);
              break;
            case SCRIPT_EVENTS.EXECUTE_COMPLETE:
              resolve(e.data.payload.args[0]);
              break;
            default:
              reject(new Error(`Unknown event type: ${e.data.type}`));
          }
        };
        worker.onerror = (e) => {
          clearTimeout(handle);
          reject(e);
        };
        worker.postMessage({
          type: SCRIPT_EVENTS.INIT_EXECUTE,
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
