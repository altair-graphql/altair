import { settingsReducer, getInitialState } from './settings.reducer';
import { SET_SETTINGS_JSON, SetSettingsJsonAction } from './settings.action';
import { getAltairConfig, AltairConfig } from 'altair-graphql-core/build/config';

describe('settings', () => {
  it('should return previous state if action is not known', () => {
    const originalState: any = { theme: 'system' };
    const newState = settingsReducer(originalState, {
      type: 'UNKNOWN_ACTION',
    } as any);
    expect(newState).toEqual(originalState);
  });

  it('should set an initial state if state is not provided', () => {
    const newState = settingsReducer(undefined, {
      type: 'UNKNOWN_ACTION',
    } as any);
    // Use the real initial state from the config
    const expectedInitialState = getInitialState();
    expect(newState).toEqual(expectedInitialState);
  });

  it(`should set settings data from provided JSON string for [${SET_SETTINGS_JSON}] action`, () => {
    const newState = settingsReducer(
      undefined,
      new SetSettingsJsonAction({
        value: `{ "theme": "light", "language": "en-US", "addQueryDepthLimit": 1, "tabSize": 1 }`,
      })
    );
    expect(newState).toMatchObject({
      theme: 'light',
      language: 'en-US',
      addQueryDepthLimit: 1,
      tabSize: 1,
    });
  });

  it(`should accept JSON strings with single line comments as valid for [${SET_SETTINGS_JSON}] action`, () => {
    const newState = settingsReducer(
      undefined,
      new SetSettingsJsonAction({
        value: `{
        // this is a single-line comment about the theme. It is a string.
        "theme": "light",
        "language": "en-US",
        "addQueryDepthLimit": 1,
        "tabSize": 1
      }`,
      })
    );
    expect(newState).toMatchObject({
      addQueryDepthLimit: 1,
      tabSize: 1,
      theme: 'light',
      language: 'en-US',
    });
  });

  it(`should throw error for invalid JSON string for [${SET_SETTINGS_JSON}] action`, () => {
    expect(() => {
      const newState = settingsReducer(
        undefined,
        new SetSettingsJsonAction({
          value: `{ invalid }`,
        })
      );
    }).toThrow();
  });
});
