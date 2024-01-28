import { CorsWorker } from './cors-worker';

export class ScriptEvaluatorWorkerFactory {
  async create() {
    try {
      return new Worker(new URL('./evaluator.worker', import.meta.url), {
        type: 'module',
      });
    } catch {
      // Try to use CORS worker if using the worker directly fails
      return new CorsWorker(new URL('./evaluator.worker', import.meta.url), {
        type: 'module',
      }).createWorker();
    }
  }
}
