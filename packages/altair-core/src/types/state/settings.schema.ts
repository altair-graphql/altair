import { boolean, number, object, record, string } from 'zod/v4';
import { themeSchema } from '../../theme';
import { multiResponseStrategySchema } from '../../request/schemas';
import { languagesSchema } from '../../config/languages';
import { DEFAULT_OPTIONS } from '../../config/defaults';
import { stripDefaults } from '../../utils/schema';

export const settingsSchema = object({
  /**
   * Specifies the theme. Themes available by default are 'light', 'dark', 'system', 'dracula'.
   * Additional themes can be added via plugins.
   * @default 'system'
   */
  theme: string()
    .meta({
      description:
        'Specifies the theme. Themes available by default are "light", "dark", "system", "dracula". Additional themes can be added via plugins.',
    })
    .default(DEFAULT_OPTIONS.DEFAULT_THEME),

  /**
   * Specifies the theme for dark mode
   */
  'theme.dark': string()
    .meta({
      description: 'Specifies the theme for dark mode',
    })
    .optional(),

  /**
   * Specifies the language
   */
  language: languagesSchema
    .meta({
      description: 'Specifies the language',
    })
    .default(DEFAULT_OPTIONS.DEFAULT_LANGUAGE),

  /**
   * Specifies how deep the 'Add query' functionality should go. You can specify any valid positive integer.
   */
  addQueryDepthLimit: number()
    .meta({
      description:
        "Specifies how deep the 'Add query' functionality should go. You can specify any valid positive integer.",
    })
    .default(DEFAULT_OPTIONS.ADD_QUERY_DEPTH_LIMIT),

  /**
   * Specifies the tab size for the editor
   */
  tabSize: number()
    .meta({
      description: 'Specifies the tab size for the editor',
    })
    .default(DEFAULT_OPTIONS.TAB_SIZE),

  /**
   * Enable experimental features.
   * Note: The features might be unstable
   * @default false
   */
  enableExperimental: boolean()
    .meta({
      description:
        'Enable experimental features. Note: The features might be unstable',
    })
    .optional(),

  /**
   * Specifies the base font size
   * @default 24
   */
  'theme.fontsize': number()
    .meta({
      description: 'Specifies the base font size',
    })
    .default(24),

  /**
   * Specifies the font family for the editors. Any valid CSS font family combination can be used here
   */
  'theme.editorFontFamily': string()
    .meta({
      description:
        'Specifies the font family for the editors. Any valid CSS font family combination can be used here',
    })
    .optional(),

  /**
   * Specifies the font size for the editors
   */
  'theme.editorFontSize': number()
    .meta({
      description: 'Specifies the font size for the editors',
    })
    .optional(),

  /**
   * Specifies if native push notifications should be disabled
   * @default false
   */
  disablePushNotification: boolean()
    .meta({
      description: 'Specifies if native push notifications should be disabled',
    })
    .default(false),

  /**
   * Specifies a list of enabled plugins.
   *
   * Plugins are specified in a string format `<plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>]`:
   * - `<plugin-source>`: The source of the plugin. Can be 'npm', 'url' or 'github'
   * - `<plugin-name>` (required): The name of the plugin. Plugin names must begin with `altair-graphql-plugin-`
   * - `<version>`: The version of the plugin. If not specified, the latest version will be used
   * - `[<opt>]->[<opt-value>]`: Additional configuration for the plugin. This is used when you specify the source as 'url'. In this case, you can specify the URL where the plugin is hosted.
   *
   * @example ['altair-graphql-plugin-some-plugin', 'npm:altair-graphql-plugin-some-plugin', 'npm:altair-graphql-plugin-some-plugin@0.3.4', 'url:altair-graphql-plugin-some-plugin@0.3.4::[url]->[http://example.com/some-plugin]']
   * @default []
   */
  'plugin.list': string()
    .array()
    .meta({
      description: `Specifies a list of enabled plugins.

      Plugins are specified in a string format '<plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>]':
      - '<plugin-source>': The source of the plugin. Can be 'npm', 'url' or 'github'
      - '<plugin-name>' (required): The name of the plugin. Plugin names must begin with 'altair-graphql-plugin-'
      - '<version>': The version of the plugin. If not specified, the latest version will be used
      - '[<opt>]->[<opt-value>]': Additional configuration for the plugin. This is used when you specify the source as 'url'. In this case, you can specify the URL where the plugin is hosted.

      @example ['altair-graphql-plugin-some-plugin', 'npm:altair-graphql-plugin-some-plugin', 'npm:altair-graphql-plugin-some-plugin@0.3.4', 'url:altair-graphql-plugin-some-plugin@0.3.4::[url]->[http://example.com/some-plugin]']`,
    })
    .default([]),

  /**
   * Send requests with credentials (cookies)
   */
  'request.withCredentials': boolean()
    .meta({
      description: 'Send requests with credentials (cookies)',
    })
    .optional(),

  /**
   * Reload schema on app start
   */
  'schema.reloadOnStart': boolean()
    .meta({ description: 'Reload schema on app start' })
    .optional(),

  /**
   * Reload schema when switching environments
   */
  'schema.reload.onEnvChange': boolean()
    .meta({ description: 'Reload schema when switching environments' })
    .optional(),

  /**
   * Disable update notification
   */
  'alert.disableUpdateNotification': boolean()
    .meta({ description: 'Disable update notification' })
    .optional(),

  /**
   * Disable warning alerts
   */
  'alert.disableWarnings': boolean()
    .meta({ description: 'Disable warning alerts' })
    .optional(),

  /**
   * Disable banners
   */
  'banners.disable': boolean().meta({ description: 'Disable banners' }).optional(),

  /**
   * Number of items allowed in history pane
   */
  historyDepth: number()
    .meta({ description: 'Number of items allowed in history pane' })
    .optional(),

  /**
   * Disable line numbers
   */
  disableLineNumbers: boolean()
    .meta({ description: 'Disable line numbers' })
    .optional(),

  /**
   * Hides deprecated Doc items
   */
  'doc.hideDeprecatedItems': boolean()
    .meta({ description: 'Hides deprecated Doc items' })
    .optional(),

  /**
   * Specify custom theme config to override the specified theme values
   */
  themeConfig: themeSchema
    .meta({
      description:
        'Specify custom theme config to override the specified theme values',
    })
    .partial()
    .optional(),

  /**
   * Theme config object for dark mode
   */
  'themeConfig.dark': themeSchema
    .meta({ description: 'Theme config object for dark mode' })
    .partial()
    .optional(),

  /**
   * Hides extensions object
   */
  'response.hideExtensions': boolean()
    .meta({ description: 'Hides extensions object' })
    .optional(),

  /**
   * Determine the handling strategy for multiple responses
   */
  'response.stream.strategy': multiResponseStrategySchema
    .meta({ description: 'Determine the handling strategy for multiple responses' })
    .optional(),

  /**
   * Contains shortcut to action mapping
   */
  'editor.shortcuts': record(string(), string())
    .meta({ description: 'Contains shortcut to action mapping' })
    .optional(),

  /**
   * Disable new editor beta
   */
  'beta.disable.newEditor': boolean()
    .meta({ description: 'Disable new editor beta' })
    .optional(),

  /**
   * Disable new script beta
   */
  'beta.disable.newScript': boolean()
    .meta({ description: 'Disable new script beta' })
    .optional(),

  /**
   * List of cookies to be accessible in the pre-request script
   * @example ['cookie1', 'cookie2']
   * @default []
   */
  'script.allowedCookies': string()
    .array()
    .meta({
      description: 'List of cookies to be accessible in the pre-request script',
    })
    .default([]),

  /**
   * List of local storage keys to be accessible in the pre-request script.
   * These will be made available read-only via the `storage` API in the script context.
   * @example ['key1', 'key2']
   * @default []
   */
  'script.allowedLocalStorageKeys': string()
    .array()
    .meta({
      description:
        'List of local storage keys to be accessible in the pre-request script. These will be made available read-only via the `storage` API in the script context.',
    })
    .default([]),

  /**
   * Enable the scrollbar in the tab list
   */
  enableTablistScrollbar: boolean()
    .meta({ description: 'Enable the scrollbar in the tab list' })
    .optional(),

  /**
   * Whether to include descriptions in the introspection result
   */
  'introspection.options.description': boolean()
    .meta({
      description: 'Whether to include descriptions in the introspection result',
    })
    .optional(),

  /**
   * Whether to include `specifiedByUrl` in the introspection result
   */
  'introspection.options.specifiedByUrl': boolean()
    .meta({
      description: 'Whether to include `specifiedByUrl` in the introspection result',
    })
    .optional(),

  /**
   * Whether to include `isRepeatable` flag on directives
   */
  'introspection.options.directiveIsRepeatable': boolean()
    .meta({ description: 'Whether to include `isRepeatable` flag on directives' })
    .optional(),

  /**
   * Whether to include `description` field on schema
   */
  'introspection.options.schemaDescription': boolean()
    .meta({ description: 'Whether to include `description` field on schema' })
    .optional(),

  /**
   * Whether target GraphQL server supports deprecation of input values
   */
  'introspection.options.inputValueDeprecation': boolean()
    .meta({
      description:
        'Whether target GraphQL server supports deprecation of input values',
    })
    .optional(),
});

export const partialSettingsSchema = stripDefaults(settingsSchema).partial();
