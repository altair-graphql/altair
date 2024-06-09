import { PluginCapabilities } from './capabilities';

// support html and js entry points
// js entry points will mean we create a new iframe and load the js file in it
interface PluginEntry {
  type: 'html';
  path: string;
}

export interface PluginV3Manifest {
  /**
   * Version of manifest (should be 3). It is a control measure for variations in the plugin versions
   */
  manifest_version: 3;

  /**
   * Name of the plugin.  It should be the same name you would use in your `package.json` file. It uniquely identifies your plugin. The plugin name must begin with `altair-graphql-plugin-`.
   */
  name: string;

  /**
   * The name of the plugin that is displayed in the UI. It is the human readable version of your plugin name.
   */
  display_name: string;

  /**
   * The version of your plugin. It should be the same version you would have in your `package.json` file (except you have a good reason why they should be different).
   */
  version: string;

  /**
   * The description of what your plugin is about. It would be used to describe your plugin.
   */
  description: string;

  /**
   * The entry point of the plugin
   */
  entry: PluginEntry;

  /**
   * Specifies the capabilities (functionalities) available to the plugin. In the future, this would be used to request the necessary permissions from the user
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
