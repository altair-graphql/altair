import { Injectable } from '@angular/core';
import { ITheme, ICustomTheme, mergeThemes } from './theme';
import light from './defaults/light';
import dark from './defaults/dark';
import dracula from './defaults/dracula';

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
  addTheme(name: string, theme: ICustomTheme) {}
  mergeThemes(...customThemes: ICustomTheme[]) {
    return mergeThemes(...customThemes);
  }
}
