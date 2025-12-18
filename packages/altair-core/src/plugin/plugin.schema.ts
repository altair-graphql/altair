import { literal, object, string, z } from 'zod/v4';

/**
 * Defines the repository of the plugin.
 * Used to know where to get the plugin from.
 */
export const pluginSourceSchema = z.enum({
  NPM: 'npm',
  GITHUB: 'github',
  URL: 'url',
});

/**
 * Specifies the type of the plugin.
 * Determines how the plugin would interact with Altair.
 */
export const pluginTypeSchema = z.enum({
  HEADER: 'header',
  SIDEBAR: 'sidebar',
  ACTION_BUTTON: 'action_button',
});

/**
 * Specifies the capabilities (functionalities) available to the plugin.
 * In the future, this would be used to request the necessary permissions from the user.
 */
export const pluginCapabilitiesSchema = z.enum([
  'query:read',
  'query:write',
  'header:read',
  'header:write',
  'environment:read',
  'environment:write',
]);

export const pluginManifestSchema = object({
  /**
   * Version of manifest. Should be 1 or 2.
   */
  manifest_version: literal(1)
    .or(literal(2))
    .meta({ description: 'Version of manifest. Should be 1 or 2.' }),

  /**
   * Name of the plugin
   */
  name: string().meta({ description: 'Name of the plugin' }),

  /**
   * Display name of the plugin
   */
  display_name: string().meta({ description: 'Display name of the plugin' }),

  /**
   * Version of the plugin
   */
  version: string().meta({ description: 'Version of the plugin' }),

  /**
   * Description of the plugin
   */
  description: string().meta({ description: 'Description of the plugin' }),

  /**
   * Author email of the plugin
   */
  author_email: string()
    .meta({ description: 'Author email of the plugin' })
    .optional(),

  /**
   * Author of the plugin
   */
  author: string().meta({ description: 'Author of the plugin' }).optional(),

  /**
   * This specifies the type of plugin. This determines how the plugin would interact with Altair. For now there is just the typical plugin type (registered plugin class). In the future, this would include other plugins like themes.
   */
  type: pluginTypeSchema
    .meta({
      description:
        'This specifies the type of plugin. This determines how the plugin would interact with Altair. For now there is just the typical plugin type (registered plugin class). In the future, this would include other plugins like themes.',
    })
    .optional(),

  /**
   * This specifies the class name of the plugin, for discovery
   */
  plugin_class: string()
    .meta({
      description: 'This specifies the class name of the plugin, for discovery',
    })
    .optional(),

  /**
   * An array containing the list of scripts (relative to the plugin root directory) that need to be loaded for the plugin to function.
   */
  scripts: string().array().meta({
    description:
      'An array containing the list of scripts (relative to the plugin root directory) that need to be loaded for the plugin to function.',
  }),

  /**
   * An array containing the list of styles (relative to the plugin root directory) that need to be loaded for the plugin to function.
   */
  styles: string()
    .array()
    .meta({
      description:
        'An array containing the list of styles (relative to the plugin root directory) that need to be loaded for the plugin to function.',
    })
    .optional(),

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
});

export const altairV1PluginSchema = object({
  name: string().meta({ description: 'Name of the plugin' }),
  display_name: string().meta({ description: 'Display name of the plugin' }),
  capabilities: pluginCapabilitiesSchema.array().meta({
    description:
      'Specifies the capabilities (functionalities) available to the plugin. In the future, this would be used to request the necessary permissions from the user',
  }),
  type: pluginTypeSchema
    .meta({
      description:
        'This specifies the type of plugin. This determines how the plugin would interact with Altair. For now there is just the typical plugin type (registered plugin class). In the future, this would include other plugins like themes.',
    })
    .optional(),
  plugin_class: string()
    .meta({
      description: 'This specifies the class name of the plugin, for discovery',
    })
    .optional(),
  manifest: pluginManifestSchema.meta({
    description: 'The plugin manifest',
  }),
});
