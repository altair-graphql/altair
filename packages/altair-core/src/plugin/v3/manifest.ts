import { literal, object, output, string, union } from 'zod/v4';
import { pluginCapabilitiesSchema } from './capabilities';

const pluginHistoryEntrySchema = object({
  type: literal('html'),
  path: string(),
});
const pluginJsEntrySchema = object({
  type: literal('js'),
  scripts: string().array(),
  styles: string().array(),
});

export const pluginEntrySchema = union([
  pluginHistoryEntrySchema,
  pluginJsEntrySchema,
]);

// support html and js entry points
// js entry points will mean we create a new iframe and load the js file in it
// FIXME: HTML entry doesn't work properly yet. jsdelivr doesn't support rendering HTML files so we need to find a way to host the HTML files for this to work.

export type PluginEntry = output<typeof pluginEntrySchema>;

const pluginIconImageSchema = object({
  type: literal('image'),
  url: string(),
});

const pluginIconSvgSchema = object({
  type: literal('svg'),
  src: string(),
});

export const pluginIconSchema = union([pluginIconImageSchema, pluginIconSvgSchema]);

export type PluginIcon = output<typeof pluginIconSchema>;

export const pluginV3ManifestSchema = object({
  /**
   * Version of manifest (should be 3). It is a control measure for variations in the plugin versions
   */
  manifest_version: literal(3).meta({
    description:
      'Version of manifest (should be 3). It is a control measure for variations in the plugin versions',
  }),

  /**
   * Name of the plugin. It should be the same name you would use in your `package.json` file. It uniquely identifies your plugin. The plugin name must begin with `altair-graphql-plugin-`.
   */
  name: string().meta({
    description:
      'Name of the plugin. It should be the same name you would use in your `package.json` file. It uniquely identifies your plugin. The plugin name must begin with `altair-graphql-plugin-`.',
  }),

  /**
   * The name of the plugin that is displayed in the UI. It is the human readable version of your plugin name.
   */
  display_name: string().meta({
    description:
      'The name of the plugin that is displayed in the UI. It is the human readable version of your plugin name.',
  }),

  /**
   * The version of your plugin. It should be the same version you would have in your `package.json` file (except you have a good reason why they should be different).
   */
  version: string().meta({
    description:
      'The version of your plugin. It should be the same version you would have in your `package.json` file (except you have a good reason why they should be different).',
  }),

  /**
   * The description of what your plugin is about. It would be used to describe your plugin.
   */
  description: string().meta({
    description:
      'The description of what your plugin is about. It would be used to describe your plugin.',
  }),

  /**
   * The entry point of the plugin
   */
  entry: pluginEntrySchema.meta({
    description: 'The entry point of the plugin',
  }),

  /**
   * Specifies the capabilities (functionalities) available to the plugin. In the future, this would be used to request the necessary permissions from the user
   */
  capabilities: pluginCapabilitiesSchema
    .array()
    .meta({
      description:
        'Specifies the capabilities (functionalities) available to the plugin. In the future, this would be used to request the necessary permissions from the user',
    })
    .optional(),

  /**
   * Email of the author of the plugin
   */
  author_email: string()
    .meta({ description: 'Email of the author of the plugin' })
    .optional(),

  /**
   * Name of the author of the plugin
   */
  author: string()
    .meta({ description: 'Name of the author of the plugin' })
    .optional(),

  /**
   * The minimum version of Altair that the plugin is compatible with. This is useful for when the plugin uses features that are only available in a certain version of Altair
   */
  minimum_altair_version: string()
    .meta({
      description:
        'The minimum version of Altair that the plugin is compatible with. This is useful for when the plugin uses features that are only available in a certain version of Altair',
    })
    .optional(),

  /**
   * The icon of the plugin. It can be an image or an SVG
   */
  icon: pluginIconSchema
    .meta({ description: 'The icon of the plugin. It can be an image or an SVG' })
    .optional(),
});

export type PluginV3Manifest = output<typeof pluginV3ManifestSchema>;
