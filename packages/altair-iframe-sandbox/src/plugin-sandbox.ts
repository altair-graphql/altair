import { PluginParentWorkerOptions } from 'altair-graphql-core/build/plugin/v3/parent-worker';

const injectPluginScript = (url: string) => {
  return new Promise((resolve, reject) => {
    const head = document.getElementsByTagName('head')[0];
    if (!head) {
      return reject(new Error('No head found!'));
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => resolve(null);
    script.onerror = (err) => reject(err);
    head.appendChild(script);
  });
};
const injectPluginStylesheet = (url: string) => {
  return new Promise((resolve, reject) => {
    const head = document.getElementsByTagName('head')[0];
    if (!head) {
      return reject(new Error('No head found!'));
    }
    const style = document.createElement('link');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.href = url;
    style.onload = () => resolve(null);
    style.onerror = (err) => reject(err);
    head.appendChild(style);
  });
};

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
      await injectPluginStylesheet(style);
    }
  }

  if (pluginSandboxOpts.scriptUrls) {
    for (const script of pluginSandboxOpts.scriptUrls) {
      await injectPluginScript(script);
    }
  }
};
