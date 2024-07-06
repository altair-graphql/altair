import { PluginParentWorkerOptions } from 'altair-graphql-core/build/plugin/v3/parent-worker';
import {
  injectScript,
  injectStylesheet,
} from 'altair-graphql-core/build/utils/inject';

export const handlePluginSandbox = async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const pluginSandboxOptsStr = searchParams.get('plugin_sandbox_opts');
  const pluginSandboxOpts = pluginSandboxOptsStr
    ? (JSON.parse(pluginSandboxOptsStr) as PluginParentWorkerOptions)
    : undefined;
  if (!pluginSandboxOpts) {
    throw new Error('Invalid plugin options provided!');
  }

  if (pluginSandboxOpts.type !== 'scripts') {
    throw new Error('Invalid plugin option type provided!');
  }

  // Remove all styles from the document (plugin styles will be injected later)
  document
    .querySelectorAll('style,link[rel="stylesheet"]')
    .forEach((item) => item.remove());

  // Load plugin scripts and styles
  if (pluginSandboxOpts.styleUrls) {
    for (const style of pluginSandboxOpts.styleUrls) {
      await injectStylesheet(style);
    }
  }

  if (pluginSandboxOpts.scriptUrls) {
    for (const script of pluginSandboxOpts.scriptUrls) {
      await injectScript(script);
    }
  }
};
