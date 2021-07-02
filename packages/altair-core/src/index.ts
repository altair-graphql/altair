import { PluginBase, PluginConstructor } from './plugin/base';

export const registerPluginClass = <T extends PluginBase>(pluginClassName: string, pluginClass: PluginConstructor<T>) => {
  (window as any)['AltairGraphQL'].plugins[pluginClassName] = pluginClass
};
