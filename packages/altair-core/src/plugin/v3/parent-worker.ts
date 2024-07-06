import { EvaluatorWorker, EventData } from '../../evaluator/worker';
import { urlWithParams } from '../../utils/url';
import { FrameOptions, InstanceType, instanceTypes } from './frame-worker';

interface BasePluginParentWorkerOptions {
  id: string;
  disableAppend?: boolean;
  instanceType?: InstanceType;
  additionalParams?: Record<string, string>;
  additionalSandboxAttributes?: string[];
}
interface PluginParentWorkerOptionsWithScripts
  extends BasePluginParentWorkerOptions {
  type: 'scripts';
  sandboxUrl: string;
  scriptUrls: string[];
  styleUrls: string[];
}

interface PluginParentWorkerOptionsWithUrl extends BasePluginParentWorkerOptions {
  type: 'url';
  pluginEntrypointUrl: string;
}
export type PluginParentWorkerOptions =
  | PluginParentWorkerOptionsWithScripts
  | PluginParentWorkerOptionsWithUrl;
export class PluginParentWorker extends EvaluatorWorker {
  constructor(private opts: PluginParentWorkerOptions) {
    super();
  }

  private iframe = this.createIframe();

  private frameReadyPromise = new Promise<void>((resolve) => {
    this.iframe.addEventListener('load', () => {
      resolve();
    });
  });

  private createIframe() {
    const iframe = document.createElement('iframe');
    iframe.id = this.opts.id;
    if (this.opts.instanceType === instanceTypes.PANEL) {
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
    } else {
      iframe.style.display = 'none';
    }

    const params: FrameOptions = {
      ...this.opts.additionalParams,
      sc: window.location.origin,
      id: this.opts.id,
      instanceType: this.getInstanceType(),
    };

    // NOTE: Don't add allow-same-origin to the sandbox attribute!
    iframe.sandbox.add('allow-scripts');
    if (this.opts.additionalSandboxAttributes) {
      this.opts.additionalSandboxAttributes.forEach((attr) => {
        iframe.sandbox.add(attr);
      });
    }
    iframe.referrerPolicy = 'no-referrer';

    if (this.opts.type === 'scripts') {
      const url = urlWithParams(this.opts.sandboxUrl, {
        ...params,
        sandbox_type: 'plugin',
        plugin_sandbox_opts: JSON.stringify(this.opts),
      });
      iframe.src = url;
      // TODO: Use srcdoc instead of src
    } else if (this.opts.type === 'url') {
      const url = urlWithParams(this.opts.pluginEntrypointUrl, params);
      iframe.src = url;
    }

    if (!this.opts.disableAppend) {
      document.body.appendChild(iframe);
    }
    return iframe;
  }

  private async frameReady() {
    await this.frameReadyPromise;
  }

  getIframe() {
    return this.iframe;
  }

  getInstanceType() {
    return this.opts.instanceType ?? instanceTypes.MAIN;
  }

  onMessage<T extends string, P = unknown>(
    handler: (e: EventData<T, P>) => void
  ): void {
    window.addEventListener(
      'message',
      (e) => {
        if (e.origin !== 'null' || e.source !== this.iframe.contentWindow) {
          return;
        }
        if (e.data.frameId !== this.opts.id) {
          console.error('Invalid frameId in data', e.data.frameId, this.opts.id);
          return;
        }
        handler(e.data);
      },
      false
    );
  }
  send<T extends string>(type: T, payload?: unknown): void {
    this.frameReady().then(() => {
      this.iframe.contentWindow?.postMessage(
        { type, payload },
        // https://web.dev/articles/sandboxed-iframes#safely_sandboxing_eval
        // Note that we're sending the message to "*", rather than some specific
        // origin. Sandboxed iframes which lack the 'allow-same-origin' header
        // don't have an origin which you can target: you'll have to send to any
        // origin, which might alow some esoteric attacks. Validate your output!
        '*'
      );
    });
  }
  onError(handler: (err: unknown) => void): void {
    this.iframe.addEventListener('error', handler);
  }
  destroy(): void {
    this.iframe.remove();
  }
}
