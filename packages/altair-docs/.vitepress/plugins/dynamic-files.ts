import { resolve } from 'path';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { getViteDynamicFilesPlugin } from './vite-dynamic-files';
import {
  altairPluginServerApprovedPluginsYamlManifestSchema,
  altairPluginServerPluginListResponseSchema,
  APSPluginListResponse,
} from 'altair-graphql-core/build/plugin/server/schema';
export const dynamicFiles = async () => {
  const pluginsYamlPath = resolve(__dirname, '../../.data/plugins.yaml');
  const parsed = altairPluginServerApprovedPluginsYamlManifestSchema.safeParse(
    parse(readFileSync(pluginsYamlPath, 'utf-8'))
  );
  if (!parsed.success) {
    console.error('Invalid plugins.yaml file', pluginsYamlPath, parsed.error);
    throw new Error(
      `Invalid plugins.yaml file. Errors: ${JSON.stringify(parsed.error)}`
    );
  }

  const validatedPlugins = await Promise.all(
    Object.entries(parsed.data.plugins)
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

  const res = altairPluginServerPluginListResponseSchema.parse({
    plugins: validatedPlugins,
  });

  return getViteDynamicFilesPlugin({
    fileName: 'data/v1/plugins.json',
    source: JSON.stringify(res),
  });
};
