import { resolve } from 'path';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import validateYamlManifest from 'altair-graphql-core/build/typegen/validate-plugins-yaml-manifest';
import { getViteDynamicFilesPlugin } from './vite-dynamic-files';
import { APSPluginListResponse } from 'altair-graphql-core/build/plugin/server/types';
export const dynamicFiles = async () => {
  const pluginsYamlPath = resolve(__dirname, '../../.data/plugins.yaml');
  const data = parse(readFileSync(pluginsYamlPath, 'utf-8'));
  if (!validateYamlManifest(data)) {
    console.error(
      'Invalid plugins.yaml file',
      pluginsYamlPath,
      validateYamlManifest.errors
    );
    throw new Error('Invalid plugins.yaml file');
  }

  const validatedPlugins = await Promise.all(
    Object.entries(data.plugins)
      .filter(([pluginName, pluginData]) => {
        if (pluginData.id !== pluginName) {
          console.error(
            `Plugin id does not match plugin name for plugin ${pluginName}`
          );
          return false;
        }
        return true;
      })
      .map(async ([, pluginData]) => {
        // TODO: Check npm for updates to the plugins
        return pluginData;
      })
  );

  const res: APSPluginListResponse = {
    plugins: validatedPlugins,
  };

  return getViteDynamicFilesPlugin({
    fileName: 'data/v1/plugins.json',
    source: JSON.stringify(res),
  });
};
