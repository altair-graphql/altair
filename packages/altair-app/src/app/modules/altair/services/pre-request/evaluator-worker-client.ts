import {
  ScriptEvaluatorClient,
  ScriptEvent,
  ScriptEventData,
} from 'altair-graphql-core/build/script/types';
import { debug } from '../../utils/logger';

export class EvaluatorWorkerClient extends ScriptEvaluatorClient {
  private worker = new Worker(new URL('./evaluator.worker', import.meta.url), {
    type: 'module',
  });
  subscribe<T extends ScriptEvent>(
    type: T,
    handler: (k: T, e: ScriptEventData<T>) => void
  ) {
    this.worker.addEventListener(
      'message',
      (e: MessageEvent<ScriptEventData<T>>) => {
        const event = e.data;

        // Handle script events
        if (event.type === type) {
          debug.log(event.type, event);
          handler(type, event);
        }
      }
    );
  }
  send(type: string, payload: any): void {
    this.worker.postMessage({
      type,
      payload,
    });
  }
  onError(handler: (err: any) => void): void {
    this.worker.addEventListener('error', handler);
  }
  destroy(): void {
    this.worker.terminate();
  }
}
