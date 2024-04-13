import {
  ScriptEvaluatorWorker,
  ScriptWorkerMessageData,
} from 'altair-graphql-core/build/script/types';
import { ScriptEvaluatorWorkerEngine } from 'altair-graphql-core/build/script/evaluator-worker-engine';
import { validOrigins } from 'altair-graphql-core/build/origins';

class EvaluatorWebWorker extends ScriptEvaluatorWorker {
  onMessage(handler: (e: ScriptWorkerMessageData) => void): void {
    self.addEventListener('message', (e) => {
      if (e.origin && !validOrigins.includes(e.origin)) {
        return;
      }
      handler(e.data);
    });
  }
  send(type: string, payload: any): void {
    self.postMessage({ type, payload });
  }
  onError(handler: (err: any) => void): void {
    self.addEventListener('error', handler);
    self.addEventListener('unhandledrejection', (e) => {
      e.preventDefault();
      handler(e.reason);
    });
  }
}

new ScriptEvaluatorWorkerEngine(new EvaluatorWebWorker()).start();
