import { Injectable } from '@angular/core';
import { dark, dracula, ICustomTheme, light, mergeThemes } from 'altair-graphql-core/build/theme';

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
