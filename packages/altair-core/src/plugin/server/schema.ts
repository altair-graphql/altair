import { object, output, record, string } from 'zod/v4';

/**
 * Altair Plugin Server - Plugin definition
 */
export const altairPluginServerPluginDefinitionSchema = object({
  /**
   * The plugin ID (used to install the plugin)
   */
  id: string().meta({ description: 'The plugin ID (used to install the plugin)' }),
  /**
   * The display name of the plugin
   */
  name: string().meta({ description: 'The display name of the plugin' }),
  /**
   * The description of the plugin
   */
  description: string().meta({ description: 'The description of the plugin' }),
  /**
   * The author of the plugin
   */
  author: string().meta({ description: 'The author of the plugin' }),
  /**
   * The GitHub repository of the plugin
   */
  repository: string().meta({ description: 'The GitHub repository of the plugin' }),
  /**
   * The homepage of the plugin
   */
  homepage: string().optional().meta({ description: 'The homepage of the plugin' }),
});

export type APSPluginDefinition = output<
  typeof altairPluginServerPluginDefinitionSchema
>;

export const altairPluginServerApprovedPluginsYamlManifestSchema = object({
  plugins: record(string(), altairPluginServerPluginDefinitionSchema).meta({
    description: 'List of approved plugins',
  }),
});
export type APSApprovedPluginsYamlManifest = output<
  typeof altairPluginServerApprovedPluginsYamlManifestSchema
>;

export const altairPluginServerPluginListResponseSchema = object({
  plugins: altairPluginServerPluginDefinitionSchema
    .array()
    .meta({ description: 'List of approved plugins' }),
});
export type APSPluginListResponse = output<
  typeof altairPluginServerPluginListResponseSchema
>;
