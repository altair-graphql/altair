import { PluginContext } from './context/context.interface';

export abstract class PluginBase {
  constructor(protected ctx: PluginContext) {}
  abstract initialize(ctx: PluginContext): void;
  abstract destroy(): void;
}

export interface PluginConstructor<T extends PluginBase = PluginBase> {
  new (): T;
}
