import * as settings from '../../actions/settings/settings';
import config from '../../config';
import { jsonc } from 'app/utils';

export type SettingsTheme = 'light' | 'dark' | 'dracula';
export type SettingsLanguage = keyof typeof config.languages;

export interface State {

  /**
   * Specifies the theme
   * Options: 'light', 'dark', 'dracula'
   */
  theme: SettingsTheme;

  /**
   * Specifies the language
   * Options:
    'en-US': 'English',
    'fr-FR': 'French',
    'es-ES': 'Español',
    'cs-CZ': 'Czech',
    'de-DE': 'German',
    'pt-BR': 'Brazilian',
    'ru-RU': 'Russian',
    'zh-CN': 'Chinese Simplified',
    'ja-JP': 'Japanese',
    'sr-SP': 'Serbian',
    'it-IT': 'Italian',
    'pl-PL': 'Polish',
    'ko-KR': 'Korean',
    'ro-RO': 'Romanian',
   */
  language: SettingsLanguage;

  /**
   * Specifies how deep the 'Add query' functionality would go
   */
  addQueryDepthLimit: number;

  /**
   * Specifies the tab size in the editor
   */
  tabSize: number;

  // 'theme.foreground': string;
  // 'theme.header.background': string;

  /**
   * Specifies the base font size
   * Default size: 24
   */
  'theme.fontsize'?: number;

  /**
   * Specifies the font family for the editors
   */
  'theme.editorFontFamily'?: string;
}

const initialState: State = {
  theme: 'light',
  language: <SettingsLanguage>config.default_language,
  addQueryDepthLimit: config.add_query_depth_limit,
  tabSize: config.tab_size,
};

export function settingsReducer(state = initialState, action: settings.Action): State {
  switch (action.type) {
    case settings.SET_SETTINGS_JSON:
      const newState = { ...initialState, ...jsonc(action.payload.value) };

      // Removes old isShown state
      delete newState.isShown;

      return newState;
    case settings.SET_THEME:
      return { ...state, theme: action.payload.value };
    case settings.SET_LANGUAGE:
      return { ...state, language: action.payload.value };
    case settings.SET_ADD_QUERY_DEPTH_LIMIT:
      return { ...state, addQueryDepthLimit: action.payload.value };
    case settings.SET_TAB_SIZE_ACTION:
      return { ...state, tabSize: action.payload.value };
    default:
      return state;
  }
}
