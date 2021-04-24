import * as settings from './settings.action';
import { getAltairConfig } from '../../config';
import { jsonc } from '../../utils';
import { SettingsLanguage, SettingsState } from './settings.interfaces';

export const getInitialState = (): SettingsState => {
  const altairConfig = getAltairConfig();
  const initialSettings = altairConfig.initialData.settings || {};
  return {
    theme: altairConfig.defaultTheme,
    language: <SettingsLanguage>altairConfig.default_language,
    addQueryDepthLimit: altairConfig.add_query_depth_limit,
    tabSize: altairConfig.tab_size,
    ...initialSettings,
  };
};

export function settingsReducer(state = getInitialState(), action: settings.Action): SettingsState {
  switch (action.type) {
    case settings.SET_SETTINGS_JSON:
      const newState = { ...getInitialState(), ...jsonc(action.payload.value) };

      return newState;
    default:
      return state;
  }
}
