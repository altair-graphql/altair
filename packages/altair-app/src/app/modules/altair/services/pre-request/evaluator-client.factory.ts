import {
  ScriptEvaluatorClient,
  ScriptEvaluatorClientFactory,
  ScriptEvent,
  ScriptEventData,
} from 'altair-graphql-core/build/script/types';
import { debug } from '../../utils/logger';
import { environment } from 'environments/environment';
import { EvaluatorWorkerClient } from './evaluator-worker-client';
import { isExtension } from 'altair-graphql-core/build/crx';
import { getAltairConfig } from 'altair-graphql-core/build/config';

export class EvaluatorFrameClient extends ScriptEvaluatorClient {
  private iframe = this.createIframe();
  private messageListeners: Array<
    (e: MessageEvent<ScriptEventData<ScriptEvent>>) => void
  > = [];

  private iframeLoadedPromise = new Promise<void>((resolve) => {
    this.iframe.addEventListener('load', () => {
      resolve();
    });
  });

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
  async send(type: string, payload: any): Promise<void> {
    await this.iframeLoadedPromise;
    this.iframe.contentWindow?.postMessage({ type, payload }, this.sandboxUrl);
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
    // Only use the worker client if:
    // - not in an mv3 extension (as they don't support unsafe-eval even in web workers)
    // - the current window is the same origin as the baseURI
    // - eval is allowed (not in a CSP restricted environment)
    if (
      !this.isManifestV3Extension() &&
      this.isSameOriginBaseURI() &&
      this.isEvalAllowed()
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

  private isManifestV3Extension() {
    return isExtension && chrome.runtime.getManifest().manifest_version === 3;
  }

  private isSameOriginBaseURI() {
    return document.baseURI && new URL(document.baseURI).origin === window.origin;
  }

  private isEvalAllowed() {
    try {
      eval('1');
      return true;
    } catch (e) {
      return false;
    }
  }
}
