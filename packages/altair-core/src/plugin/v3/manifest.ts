import { PluginCapabilities } from './capabilities';

// support html and js entry points
// js entry points will mean we create a new iframe and load the js file in it
interface PluginEntry {
  type: 'html';
  path: string;
}

export interface PluginV3Manifest {
  /**
   * Version of manifest (should be 3)
   */
  manifest_version: 3;

  /**
   * Name of the plugin
   */
  name: string;

  /**
   * Display name of the plugin
   */
  display_name: string;

  /**
   * Version of the plugin
   */
  version: string;

  /**
   * Description of the plugin
   */
  description: string;

  /**
   * The entry point of the plugin
   */
  entry: PluginEntry;

  /**
   * capabilities of the plugin
   */
  capabilities?: PluginCapabilities[];

  /**
   * Email of the author of the plugin
   */
  author_email?: string;

  /**
   * Name of the author of the plugin
   */
  author?: string;
}
