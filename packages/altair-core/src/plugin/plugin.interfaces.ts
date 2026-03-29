import { output } from 'zod/v4';
import {
  altairV1PluginSchema,
  pluginManifestSchema,
  pluginSourceSchema,
  pluginTypeSchema,
} from './plugin.schema';

export type PluginSource = output<typeof pluginSourceSchema>;
export type PluginType = output<typeof pluginTypeSchema>;
export type PluginManifest = output<typeof pluginManifestSchema>;
export type AltairV1Plugin = output<typeof altairV1PluginSchema>;

export const createV1Plugin = (
  name: string,
  manifest: PluginManifest
): AltairV1Plugin => {
  return altairV1PluginSchema.parse({
    name,
    manifest,
    type: manifest.type,
    display_name: manifest.display_name || name,
    plugin_class: manifest.plugin_class,
    capabilities: Array.from(
      new Set([...(manifest.capabilities || []), ...['query:read', 'query:write']])
    ),
  });
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
