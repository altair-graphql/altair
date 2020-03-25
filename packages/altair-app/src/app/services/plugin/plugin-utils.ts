import { PluginInstance, ActionPlugin } from './plugin';

export const getActionPluginClass = (plugin: PluginInstance) => {
  if (plugin.manifest.action_button_opts && plugin.manifest.action_button_opts.class_name) {
    return (window as any)['AltairGraphQL'].plugins[plugin.manifest.action_button_opts.class_name] as ActionPlugin;
  }
  return;
};
