import { EvaluatorWorker, EventData } from '../../evaluator/worker';

export const instanceTypes = {
  MAIN: 'main',
  PANEL: 'panel',
} as const;
export type InstanceType = (typeof instanceTypes)[keyof typeof instanceTypes];

export interface FrameQueryParams {
  sc: string;
  id: string;
  instanceType: InstanceType;
  [key: string]: string;
}
export class PluginFrameWorker extends EvaluatorWorker {
  private origin: string;
  private id: string;
  private instanceType: InstanceType = instanceTypes.MAIN;
  private params: FrameQueryParams;

  constructor() {
    super();
    const params: FrameQueryParams = Object.fromEntries(
      new URLSearchParams(window.location.search)
    ) as FrameQueryParams;
    this.params = params;
    // Get the source origin that embeds the iframe from the URL query parameter

    if (!params.sc) {
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
    window.parent.postMessage({ type, payload }, this.origin);
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
