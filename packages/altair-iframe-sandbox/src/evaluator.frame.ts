import {
  ScriptEvaluatorWorker,
  ScriptWorkerMessageData,
} from 'altair-graphql-core/build/script/types';
import { validOrigins } from 'altair-graphql-core/build/origins';

export class EvaluatorFrameWorker extends ScriptEvaluatorWorker {
  origin = '';

  constructor() {
    super();
    const params = new URLSearchParams(window.location.search);
    // Get the source origin that embeds the iframe from the URL query parameter
    const source = params.get('sc');

    if (!source || !validOrigins.includes(source)) {
      throw new Error('Invalid source provided!');
    }
    this.origin = source;
  }

  onMessage(handler: (e: ScriptWorkerMessageData) => void): void {
    window.addEventListener('message', (e) => {
      if (e.origin && !validOrigins.includes(e.origin)) {
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
