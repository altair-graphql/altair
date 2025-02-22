/**
 * Altair Plugin Server - Plugin definition
 */
export interface APSPluginDefinition {
  /**
   * The plugin ID (used to install the plugin)
   */
  id: string;

  /**
   * The display name of the plugin
   */
  name: string;

  /**
   * The description of the plugin
   */
  description: string;

  /**
   * The author of the plugin
   */
  author: string;

  /**
   * The GitHub repository of the plugin
   */
  repository: string;

  /**
   * The homepage of the plugin
   */
  homepage?: string;
}

export interface APSApprovedPluginsYamlManifest {
  plugins: {
    [id: string]: APSPluginDefinition;
  };
}

export interface APSPluginListResponse {
  plugins: APSPluginDefinition[];
}
