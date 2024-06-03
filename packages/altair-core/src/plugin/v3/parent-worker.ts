import { EvaluatorWorker, EventData } from '../../evaluator/worker';
import { urlWithParams } from '../../utils/url';
import { FrameQueryParams, InstanceType, instanceTypes } from './frame-worker';

export interface PluginParentWorkerOptions {
  id: string;
  pluginEntrypointUrl: string;
  disableAppend?: boolean;
  instanceType?: InstanceType;
  additionalParams?: Record<string, string>;
  additionalSandboxAttributes?: string[];
}
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

    const params: FrameQueryParams = {
      ...this.opts.additionalParams,
      sc: window.location.origin,
      id: this.opts.id,
      instanceType: this.getInstanceType(),
    };
    const url = urlWithParams(this.opts.pluginEntrypointUrl, params);
    iframe.src = url;

    iframe.sandbox.add('allow-scripts');
    iframe.sandbox.add('allow-same-origin');
    if (this.opts.additionalSandboxAttributes) {
      this.opts.additionalSandboxAttributes.forEach((attr) => {
        iframe.sandbox.add(attr);
      });
    }
    iframe.referrerPolicy = 'no-referrer';
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
        if (e.origin !== new URL(this.opts.pluginEntrypointUrl).origin) {
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
        this.opts.pluginEntrypointUrl
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
