import { getAltairConfig } from '../../config';
import { ICustomTheme } from '../../theme';

const config = getAltairConfig();
export type SettingsLanguage = keyof typeof config.languages;

export interface SettingsState {
  /**
   * Theme
   */
  theme: string;

  /**
   * Theme for dark mode
   */
  'theme.dark'?: string;

  /**
   * Set language
   */
  language: SettingsLanguage;

  /**
   * 'Add query' functionality depth
   */
  addQueryDepthLimit: number;

  /**
   * Editor tab size
   */
  tabSize: number;

  /**
   * Enable experimental features.
   * Note: Might be unstable
   */
  enableExperimental?: boolean;

  /**
   * Base Font Size
   * (Default - 24)
   */
  'theme.fontsize'?: number;

  /**
   * Editor Font Family
   */
  'theme.editorFontFamily'?: string;

  /**
   * Editor Font Size
   */
  'theme.editorFontSize'?: number;

  /**
   * Disable push notifications
   */
  disablePushNotification?: boolean;

  /**
   * Enabled plugins
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
   * Disable update notification
   */
  'alert.disableUpdateNotification'?: boolean;

  /**
   * Disable warning alerts
   */
  'alert.disableWarnings'?: boolean;

  /**
   * Number of items allowed in history pane
   */
  historyDepth?: number;

  /**
   * Disable line numbers
   */
  disableLineNumbers?: boolean;

  /**
   * Theme config object
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
}
