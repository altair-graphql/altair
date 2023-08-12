export class ScriptEvaluatorWorkerFactory {
  create() {
    return new Worker(new URL('./evaluator.worker', import.meta.url), {
      type: 'module',
    });
  }
}
