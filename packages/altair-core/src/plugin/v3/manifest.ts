import { PluginCapabilities } from './capabilities';

// support html and js entry points
// js entry points will mean we create a new iframe and load the js file in it
// FIXME: HTML entry doesn't work properly yet. jsdelivr doesn't support rendering HTML files so we need to find a way to host the HTML files for this to work.
interface PluginHtmlEntry {
  type: 'html';
  path: string;
}

interface PluginJsEntry {
  type: 'js';
  scripts: string[];
  styles: string[];
}

export type PluginEntry = PluginHtmlEntry | PluginJsEntry;

interface PluginIconImage {
  type: 'image';
  url: string;
}

interface PluginIconSvg {
  type: 'svg';
  src: string;
}

export type PluginIcon = PluginIconImage | PluginIconSvg;

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

  /**
   * The minimum version of Altair that the plugin is compatible with. This is useful for when the plugin uses features that are only available in a certain version of Altair
   */
  minimum_altair_version?: string;

  /**
   * The icon of the plugin. It can be an image or an SVG
   */
  icon?: PluginIcon;
}
