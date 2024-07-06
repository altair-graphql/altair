import { EvaluatorWorker, EventData } from '../../evaluator/worker';

export const instanceTypes = {
  MAIN: 'main',
  PANEL: 'panel',
} as const;
export type InstanceType = (typeof instanceTypes)[keyof typeof instanceTypes];

export interface FrameOptions {
  /**
   * Source origin of the parent window
   */
  sc: string;

  /**
   * Plugin ID
   */
  id: string;

  /**
   * Instance type of the plugin
   */
  instanceType: InstanceType;

  /**
   * Additional parameters
   */
  [key: string]: string;
}
export class PluginFrameWorker extends EvaluatorWorker {
  private origin: string;
  private id: string;
  private instanceType: InstanceType = instanceTypes.MAIN;
  private params: FrameOptions;

  constructor() {
    super();
    // Check for params in special params object on the window object first. Using srcdoc, we will set the params on the window object
    const paramFromWindow = (window as any).__ALTAIR_PLUGIN_PARAMS__ as FrameOptions;
    const paramsFromUrl = Object.fromEntries(
      new URLSearchParams(window.location.search)
    ) as FrameOptions;
    const params: FrameOptions = paramFromWindow ?? paramsFromUrl;
    this.params = params;

    if (!params.sc) {
      console.log('Invalid source provided!', paramFromWindow, paramsFromUrl);
      throw new Error('Invalid source provided!');
    }
    if (!params.id) {
      throw new Error('Invalid plugin ID provided!');
    }

    this.origin = params.sc;
    this.id = params.id;
    this.instanceType = params.instanceType ?? instanceTypes.MAIN;
  }

  getInstanceType() {
    return this.instanceType;
  }

  getParams() {
    return this.params;
  }

  onMessage<T extends string, P = unknown>(
    handler: (e: EventData<T, P>) => void
  ): void {
    window.addEventListener('message', (e) => {
      if (e.origin !== this.origin) {
        return;
      }
      handler(e.data);
    });
  }

  send(type: string, payload: any): void {
    window.parent.postMessage({ type, payload, frameId: this.id }, this.origin);
  }

  onError(handler: (err: any) => void): void {
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', (e) => {
      e.preventDefault();
      handler(e.reason);
    });
  }

  destroy(): void {
    // cleanup resources
    window.close();
  }
}
