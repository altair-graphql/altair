import {
  ScriptEvaluatorClient,
  ScriptEvaluatorClientFactory,
  ScriptEvent,
  ScriptEventData,
} from 'altair-graphql-core/build/script/types';
import { debug } from '../../utils/logger';
import { environment } from 'environments/environment';
import { EvaluatorWorkerClient } from './evaluator-worker-client';
import { isExtension } from '../../utils';
import { getAltairConfig } from 'altair-graphql-core/build/config';

export class EvaluatorFrameClient extends ScriptEvaluatorClient {
  private iframe = this.createIframe();
  private messageListeners: Array<
    (e: MessageEvent<ScriptEventData<ScriptEvent>>) => void
  > = [];

  constructor(private sandboxUrl: string) {
    super();
  }

  private createIframe() {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    const sandboxUrl = new URL(this.sandboxUrl);
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
    const listener = (e: MessageEvent<ScriptEventData<T>>) => {
      if (e.origin !== new URL(this.sandboxUrl).origin) {
        return;
      }
      const event = e.data;

      // Handle script events
      if (event.type === type) {
        debug.log(event.type, event);
        handler(type, event);
      }
    };

    window.addEventListener('message', listener);
    // FIXME: we shouldn't use any here
    this.messageListeners.push(listener as any);
  }
  send(type: string, payload: any): void {
    this.iframe.addEventListener('load', () => {
      this.iframe.contentWindow?.postMessage({ type, payload }, this.sandboxUrl);
    });
  }
  onError(handler: (err: any) => void): void {
    this.iframe.addEventListener('error', handler);
  }
  destroy(): void {
    this.messageListeners.forEach((listener) => {
      window.removeEventListener('message', listener);
    });
    this.iframe.removeAllListeners?.();
    this.iframe.remove();
  }
}

export class EvaluatorClientFactory implements ScriptEvaluatorClientFactory {
  async create() {
    // If the current window is the same origin as the baseURI (except for mv3 extension), then use the worker client
    if (
      document.baseURI &&
      new URL(document.baseURI).origin === window.origin &&
      // don't use worker client for manifest v3 extensions, as they don't support unsafe-eval even in web workers
      !(isExtension && chrome.runtime.getManifest().manifest_version === 3)
    ) {
      return new EvaluatorWorkerClient();
    }
    return new EvaluatorFrameClient(
      await getAltairConfig().getUrl(
        'sandbox',
        environment.production ? 'production' : 'development'
      )
    );
  }
}
