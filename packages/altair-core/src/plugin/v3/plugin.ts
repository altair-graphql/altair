import { PluginV3Context } from './context';
import { PluginFrameEngine } from './frame-engine';
import { PluginFrameWorker } from './frame-worker';
import { AltairV3Panel } from './panel';

export interface PluginV3Options {
  panels: Record<string, AltairV3Panel>;
}

export abstract class PluginV3 {
  private engine: PluginFrameEngine;
  constructor(private options: PluginV3Options = { panels: {} }) {
    const worker = new PluginFrameWorker();
    this.engine = new PluginFrameEngine(worker, this.options);
    this.initializeWhenReady();
  }
  // TODO: Pass type of keyof panels to context for better type checking
  private initializeWhenReady() {
    if (!this.engine.canInitialize()) {
      return;
    }
    this.engine.ready().then(() => {
      this.initialize(this.engine.getContext());
    });
  }
  abstract initialize(ctx: PluginV3Context): void;
  abstract destroy(): void;
}
