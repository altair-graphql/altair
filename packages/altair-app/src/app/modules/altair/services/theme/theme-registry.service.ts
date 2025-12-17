import { Injectable } from '@angular/core';
import {
  dark,
  dracula,
  ICustomTheme,
  light,
  mergeThemes,
  transformOldThemeConfigToNewThemeConfig,
} from 'altair-graphql-core/build/theme';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ThemeRegistryService {
  private registry = new Map<string, ICustomTheme>();

  constructor() {
    this.addDefaults();
  }

  addDefaults() {
    this.registry.set('light', light);
    this.registry.set('dark', dark);
    this.registry.set('dracula', dracula);
  }

  getTheme(name: string) {
    return this.registry.get(name);
  }
  getThemeFromSettings(settings: SettingsState, darkMode = false) {
    // Get specified theme
    // Add deprecated theme options
    // Warn about deprecated theme options, with alternatives
    // Add theme config object from settings
    const settingsTheme = darkMode ? settings['theme.dark'] : settings.theme;
    if (darkMode && !settingsTheme) {
      // don't configure dark theme if this is not set in settings
      return;
    }

    const selectedTheme = (settingsTheme && this.getTheme(settingsTheme)) || {
      isSystem: true,
    };
    const deperecatedThemeConfig: ICustomTheme = {
      ...(settings['theme.fontsize'] && {
        'fontSize.remBase': settings['theme.fontsize'],
      }),
      ...(settings['theme.editorFontSize'] && {
        'fontSize.code': settings['theme.editorFontSize'],
      }),
      ...(settings['theme.editorFontFamily'] && {
        'fontFamily.code': settings['theme.editorFontFamily'],
      }),
    };
    const settingsThemeConfig = transformOldThemeConfigToNewThemeConfig(
      (darkMode ? settings['themeConfig.dark'] : settings.themeConfig) || {}
    );
    const finalTheme = this.mergeThemes(
      selectedTheme,
      deperecatedThemeConfig,
      settingsThemeConfig
    );
    return finalTheme;
  }

  addTheme(name: string, theme: ICustomTheme) {
    if (this.registry.has(name)) {
      throw new Error(`"${name}" theme already exists`);
    }
    this.registry.set(name, theme);
  }
  mergeThemes(...customThemes: ICustomTheme[]) {
    return mergeThemes(...customThemes);
  }

  getAllThemes() {
    return Array.from(this.registry.keys());
  }
}
