import { PluginConstructor } from "../../altair-core/build/plugin/base";

export const registerPluginClass = (pluginClassName: string, pluginClass: PluginConstructor) => {
  (window as any)['AltairGraphQL'].plugins[pluginClassName] = pluginClass;
};
