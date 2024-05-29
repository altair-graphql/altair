import {
  ScriptEvaluatorWorker,
  ScriptWorkerMessageData,
} from 'altair-graphql-core/build/script/types';

export class EvaluatorFrameWorker extends ScriptEvaluatorWorker {
  private origin: string;

  constructor() {
    super();
    const params = new URLSearchParams(window.location.search);
    // Get the source origin that embeds the iframe from the URL query parameter
    const source = params.get('sc');

    if (!source) {
      throw new Error('Invalid source provided!');
    }
    this.origin = source;
  }

  onMessage(handler: (e: ScriptWorkerMessageData) => void): void {
    window.addEventListener('message', (e) => {
      if (e.origin !== this.origin) {
        return;
      }
      handler(e.data);
    });
  }
  send(type: string, payload: any): void {
    window.parent.postMessage({ type, payload }, this.origin);
  }
  onError(handler: (err: any) => void): void {
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', (e) => {
      e.preventDefault();
      handler(e.reason);
    });
  }
}
