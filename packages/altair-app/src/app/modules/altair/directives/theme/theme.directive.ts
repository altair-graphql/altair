import { Directive, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import {
  createTheme,
  hexToRgbStr,
  ICustomTheme,
  ITheme,
  getCSS,
} from 'altair-graphql-core/build/theme';

import { css } from '@emotion/css';
import { ThemeRegistryService } from '../../services';
import { NzConfigService } from 'ng-zorro-antd/core/config';

@Directive({
  selector: '[appTheme]',
})
export class ThemeDirective implements OnInit, OnChanges {
  @Input() appTheme: ICustomTheme = {};
  @Input() appDarkTheme: ICustomTheme = {};
  @Input() appAccentColor = '';

  private className = '';

  constructor(private nzConfigService: NzConfigService) {}

  ngOnInit() {
    this.applyTheme(this.appTheme, this.appDarkTheme, this.appAccentColor);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.appTheme?.currentValue ||
      changes?.appDarkTheme?.currentValue ||
      changes?.appAccentColor?.currentValue
    ) {
      this.applyTheme(
        changes.appTheme?.currentValue,
        changes.appDarkTheme?.currentValue,
        changes.appAccentColor?.currentValue ?? this.appAccentColor
      );
    }
  }

  getDynamicClassName(
    appTheme: ICustomTheme,
    appDarkTheme?: ICustomTheme,
    accentColor?: string
  ) {
    return css(getCSS(appTheme, appDarkTheme, accentColor));
  }

  applyTheme(theme: ICustomTheme, darkTheme?: ICustomTheme, accentColor?: string) {
    this.nzConfigService.set('theme', {
      primaryColor: theme.colors?.primary,
      errorColor: theme.colors?.red,
      warningColor: theme.colors?.yellow,
      successColor: theme.colors?.green,
    });
    this.addHTMLClass(theme, darkTheme, accentColor);
  }

  addHTMLClass(
    appTheme: ICustomTheme,
    appDarkTheme?: ICustomTheme,
    accentColor?: string
  ) {
    if (this.className) {
      document.documentElement.classList.remove(this.className);
    }

    this.className = this.getDynamicClassName(appTheme, appDarkTheme, accentColor);
    document.documentElement.classList.add(this.className);
  }
}
