import {
  ScriptEvaluatorClient,
  ScriptEvaluatorClientFactory,
  ScriptEvent,
  ScriptEventData,
} from 'altair-graphql-core/build/script/types';
import { getClientConfig } from '@altairgraphql/api-utils';
import { debug } from '../../utils/logger';
import { environment } from 'environments/environment';

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

export class EvaluatorFrameClient extends ScriptEvaluatorClient {
  private config = getClientConfig(
    environment.production ? 'production' : 'development'
  );
  private iframe = this.createIframe();

  createIframe() {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    const sandboxUrl = new URL(this.config.sandboxUrl);
    sandboxUrl.searchParams.set('sc', window.location.origin);
    sandboxUrl.searchParams.set('action', 'evaluator');
    iframe.src = sandboxUrl.toString();

    iframe.sandbox.add('allow-scripts');
    iframe.sandbox.add('allow-same-origin');
    iframe.referrerPolicy = 'no-referrer';
    document.body.appendChild(iframe);
    return iframe;
  }
  subscribe<T extends ScriptEvent>(
    type: T,
    handler: (type: T, e: ScriptEventData<T>) => void
  ): void {
    window.addEventListener('message', (e: MessageEvent<ScriptEventData<T>>) => {
      if (e.origin !== new URL(this.config.sandboxUrl).origin) {
        return;
      }
      const event = e.data;

      // Handle script events
      if (event.type === type) {
        debug.log(event.type, event);
        handler(type, event);
      }
    });
  }
  send(type: string, payload: any): void {
    this.iframe.addEventListener('load', () => {
      this.iframe.contentWindow?.postMessage(
        { type, payload },
        this.config.sandboxUrl
      );
    });
  }
  onError(handler: (err: any) => void): void {
    this.iframe.addEventListener('error', handler);
  }
  destroy(): void {
    this.iframe.remove();
  }
}
export class EvaluatorClientFactory implements ScriptEvaluatorClientFactory {
  create() {
    if (document.baseURI && new URL(document.baseURI).origin === window.origin) {
      return new EvaluatorWorkerClient();
    }
    return new EvaluatorFrameClient();
  }
}
