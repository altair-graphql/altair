import { settingsReducer } from './settings.reducer';
import { SET_SETTINGS_JSON, SetSettingsJsonAction } from './settings.action';

let mockAltairConfig = {
  initialData: {},
  defaultTheme: 'system',
  default_language: 'en-US',
  add_query_depth_limit: 1,
  tab_size: 1,
};
jest.mock('altair-graphql-core/build/config', () => {
  return {
    getAltairConfig() {
      return mockAltairConfig;
    }
  }
});

describe('settings', () => {
  beforeEach(() => {
    mockAltairConfig = {
      initialData: {},
      defaultTheme: 'system',
      default_language: 'en-US',
      add_query_depth_limit: 1,
      tab_size: 1,
    };
  });
  it('should return previous state if action is not known', () => {
    const originalState: any = { theme: 'system' };
    const newState = settingsReducer(originalState, { type: 'UNKNOWN_ACTION' } as any);
    expect(newState).toEqual(originalState);
  });

  it('should set an initial state if state is not provided', () => {
    const newState = settingsReducer(undefined, { type: 'UNKNOWN_ACTION' } as any);
    expect(newState).toEqual({
      theme: 'system',
      language: 'en-US',
      addQueryDepthLimit: 1,
      tabSize: 1,
    });
  });

  it('should set an initial state based on the user-provided initial data if state is not provided', () => {
    mockAltairConfig = {
      initialData: {
        settings: {
          theme: 'dark',
          disablePushNotification: true,
        }
      },
      defaultTheme: 'system',
      default_language: 'en-US',
      add_query_depth_limit: 1,
      tab_size: 1,
    };
    const newState = settingsReducer(undefined, { type: 'UNKNOWN_ACTION' } as any);
    expect(newState).toEqual({
      theme: 'dark',
      disablePushNotification: true,
      language: 'en-US',
      addQueryDepthLimit: 1,
      tabSize: 1,
    });
  });

  it(`should set settings data from provided JSON string for [${SET_SETTINGS_JSON}] action`, () => {
    const newState = settingsReducer(undefined, new SetSettingsJsonAction({
      value: `{ "theme": "light", "language": "en-US", "addQueryDepthLimit": 1, "tabSize": 1 }`
    }));
    expect(newState).toEqual({
      theme: 'light',
      language: 'en-US',
      addQueryDepthLimit: 1,
      tabSize: 1,
    });
  });

  it(`should accept JSON strings with single line comments as valid for [${SET_SETTINGS_JSON}] action`, () => {
    const newState = settingsReducer(undefined, new SetSettingsJsonAction({
      value: `{
        // this is a single-line comment about the theme. It is a string.
        "theme": "light",
        "language": "en-US",
        "addQueryDepthLimit": 1,
        "tabSize": 1
      }`
    }));
    expect(newState).toEqual({
      theme: 'light',
      language: 'en-US',
      addQueryDepthLimit: 1,
      tabSize: 1,
    });
  });

  it(`should throw error for invalid JSON string for [${SET_SETTINGS_JSON}] action`, () => {
    expect(() => {
      const newState = settingsReducer(undefined, new SetSettingsJsonAction({
        value: `{ invalid }`
      }));
    }).toThrow();
  });
});
