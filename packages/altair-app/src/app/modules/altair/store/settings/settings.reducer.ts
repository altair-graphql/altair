import * as settings from './settings.action';
import { jsonc } from '../../utils';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { AllActions } from '../action';
import { settingsSchema } from 'altair-graphql-core/build/types/state/settings.schema';

export const getInitialState = (): SettingsState => {
  const altairConfig = getAltairConfig();
  const initialSettings = settingsSchema.parse(
    altairConfig.options.initialSettings ?? {}
  );
  return initialSettings;
};

export function settingsReducer(
  state = getInitialState(),
  action: AllActions
): SettingsState {
  const persistedSettings = getAltairConfig().options.persistedSettings ?? {};
  switch (action.type) {
    case settings.SET_SETTINGS_JSON: {
      const newState = {
        ...getInitialState(),
        ...jsonc(action.payload.value),
        ...persistedSettings, // apply persisted settings last
      };

      return newState;
    }
    case settings.UPDATE_SETTINGS: {
      const newState = {
        ...state,
        ...action.payload,
        ...persistedSettings, // apply persisted settings last
      };
      return newState;
    }
    default:
      return {
        ...state,
        ...persistedSettings, // apply persisted settings last
      };
  }
}
