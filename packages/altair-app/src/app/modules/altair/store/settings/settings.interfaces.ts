import { getAltairConfig } from '../../config';
import { ICustomTheme } from '../../services/theme';

const config = getAltairConfig();
export type SettingsLanguage = keyof typeof config.languages;

export interface SettingsState {

  /**
   * Theme
   */
  theme: string;

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
   * Disable warning alerts
   */
  'alert.disableWarnings'?: boolean;

  /**
   * Number of items allowed in history pane
   */
  historyDepth?: number;

  /**
   * Theme config object
   */
  themeConfig?: ICustomTheme;

  /**
   * Hides extensions object
   */
  'response.hideExtensions'?: boolean;
}