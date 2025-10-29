import { getAltairConfig } from '../../config';
import { MultiResponseStrategy } from '../../request/types';
import { ICustomTheme } from '../../theme';

const config = getAltairConfig();
export type SettingsLanguage = keyof typeof config.languages;

export interface SettingsState {
  /**
   * Specifies the theme. Themes available by default are 'light', 'dark', 'system', 'dracula'.
   * Additional themes can be added via plugins.
   * @default 'system'
   */
  theme: string;

  /**
   * Specifies the theme for dark mode
   */
  'theme.dark'?: string;

  /**
   * Specifies the language
   */
  language: SettingsLanguage;

  /**
   * Specifies how deep the 'Add query' functionality should go. You can specify any valid positive integer.
   */
  addQueryDepthLimit: number;

  /**
   * Specifies the tab size for the editor
   */
  tabSize: number;

  /**
   * Enable experimental features.
   * Note: The features might be unstable
   * @default false
   */
  enableExperimental?: boolean;

  /**
   * Specifies the base font size
   * @default 24
   */
  'theme.fontsize'?: number;

  /**
   * Specifies the font family for the editors. Any valid CSS font family combination can be used here
   */
  'theme.editorFontFamily'?: string;

  /**
   * Specifies the font size for the editors
   */
  'theme.editorFontSize'?: number;

  /**
   * Specifies if native push notifications should be disabled
   * @default false
   */
  disablePushNotification?: boolean;

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
  'plugin.list'?: string[];

  /**
   * Send requests with credentials (cookies)
   */
  'request.withCredentials'?: boolean;

  /**
   * Reload schema on app start
   */
  'schema.reloadOnStart'?: boolean;

  /**
   * Reload schema when switching environments
   */
  'schema.reload.onEnvChange'?: boolean;

  /**
   * Disable update notification
   */
  'alert.disableUpdateNotification'?: boolean;

  /**
   * Disable warning alerts
   */
  'alert.disableWarnings'?: boolean;

  /**
   * Disable banners
   */
  'banners.disable'?: boolean;

  /**
   * Number of items allowed in history pane
   */
  historyDepth?: number;

  /**
   * Disable line numbers
   */
  disableLineNumbers?: boolean;

  /**
   * Hides deprecated Doc items
   */
  'doc.hideDeprecatedItems'?: boolean;

  /**
   * Specify custom theme config to override the specified theme values
   */
  themeConfig?: ICustomTheme;

  /**
   * Theme config object for dark mode
   */
  'themeConfig.dark'?: ICustomTheme;

  /**
   * Hides extensions object
   */
  'response.hideExtensions'?: boolean;

  /**
   * Determine the handling strategy for multiple responses
   */
  'response.stream.strategy'?: MultiResponseStrategy;

  /**
   * Contains shortcut to action mapping
   */
  'editor.shortcuts'?: Record<string, string>;

  /**
   * Disable new editor beta
   */
  'beta.disable.newEditor'?: boolean;

  /**
   * Disable new script beta
   */
  'beta.disable.newScript'?: boolean;

  /**
   * List of cookies to be accessible in the pre-request script
   * @example ['cookie1', 'cookie2']
   * @default []
   */
  'script.allowedCookies'?: string[];

  /**
   * Enable the scrollbar in the tab list
   */
  enableTablistScrollbar?: boolean;

  /**
   * Whether to include descriptions in the introspection result
   */
  'introspection.options.description'?: boolean;

  /**
   * Whether to include `specifiedByUrl` in the introspection result
   */
  'introspection.options.specifiedByUrl'?: boolean;

  /**
   * Whether to include `isRepeatable` flag on directives
   */
  'introspection.options.directiveIsRepeatable'?: boolean;

  /**
   * Whether to include `description` field on schema
   */
  'introspection.options.schemaDescription'?: boolean;

  /**
   * Whether target GraphQL server supports deprecation of input values
   */
  'introspection.options.inputValueDeprecation'?: boolean;

  /**
   * Maximum number of windows/tabs allowed
   * @default 50 (Electron), 15 (Web)
   */
  maxWindows?: number;
}

// Partial settings state for generating partial validator
type PartialSettingsState = Partial<SettingsState>;
