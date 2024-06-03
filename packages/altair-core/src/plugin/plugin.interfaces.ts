/**
 * Defines the repository of the plugin.
 * Used to know where to get the plugin from.
 */
export enum PluginSource {
  NPM = 'npm',
  GITHUB = 'github',
  URL = 'url',
}

/**
 * Specifies the type of the plugin.
 * Determines how the plugin would interact with Altair.
 */
export enum PluginType {
  HEADER = 'header',
  SIDEBAR = 'sidebar',
  ACTION_BUTTON = 'action_button',
}

/**
 * Specifies the capabilities (functionalities) available to the plugin.
 * In the future, this would be used to request the necessary permissions from the user.
 */
export type PluginCapabilities =
  | 'query:read'
  | 'query:write'
  | 'header:read'
  | 'header:write'
  | 'environment:read'
  | 'environment:write';

/**
 * Plugin Manifest Structure
 */
export interface PluginManifest {
  // Version of manifest. Should be 1 or 2.
  manifest_version: 1 | 2;
  name: string;
  display_name: string;
  version: string;
  description: string;
  author_email?: string;
  author?: string;
  type?: PluginType;
  plugin_class?: string;
  scripts: string[];
  styles?: string[];
  // Plugin capabilities
  capabilities?: PluginCapabilities[];
}

export interface AltairV1Plugin {
  name: string;
  display_name: string;
  capabilities: PluginCapabilities[];
  type?: PluginType;
  plugin_class?: string;
  manifest: PluginManifest;
}

export const createV1Plugin = (
  name: string,
  manifest: PluginManifest
): AltairV1Plugin => {
  return {
    name,
    manifest,
    type: manifest.type,
    display_name: manifest.display_name || name,
    plugin_class: manifest.plugin_class,
    capabilities: Array.from(
      new Set([
        ...(manifest.capabilities || []),
        ...(['query:read', 'query:write'] as PluginCapabilities[]),
      ])
    ),
  };
};

export interface RemotePluginListItem {
  name: string;
  version: string;
  description: string;
  author: string | null;
  created_at: number;
  updated_at: number;
  homepage: string | null;
  summary: string | null;
  manifest: PluginManifest;
}

export interface RemotePluginListResponse {
  page: number;
  total: number;
  items: RemotePluginListItem[];
}
