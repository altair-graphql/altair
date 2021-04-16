import { Injectable } from '@angular/core';
import { ITheme, ICustomTheme, mergeThemes } from './theme';
import light from './defaults/light';
import dark from './defaults/dark';
import dracula from './defaults/dracula';
import deep_blue from './defaults/deep_blue';

@Injectable({
  providedIn: 'root'
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
    this.registry.set('deep_blue', deep_blue);
  }

  getTheme(name: string) {
    return this.registry.get(name);
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
