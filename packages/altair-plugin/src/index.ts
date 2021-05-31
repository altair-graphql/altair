import type { PluginClass, PluginClassInstance, PluginContext } from 'altair-exported-types/dist/app/modules/altair/services/plugin/plugin';
export * from 'altair-exported-types/dist/app/modules/altair/services/subscriptions/subscription-provider';
export type {
  PluginClassInstance,
  PluginContext,
};

export const registerPluginClass = (pluginClassName: string, pluginClass: PluginClass) => {
  (window as any)['AltairGraphQL'].plugins[pluginClassName] = pluginClass
};
