import { PluginClass } from 'altair-graphql-core/build/plugin/plugin.interfaces';

export const registerPluginClass = (pluginClassName: string, pluginClass: PluginClass) => {
  (window as any)['AltairGraphQL'].plugins[pluginClassName] = pluginClass
};
