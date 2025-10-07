import { Directive, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ICustomTheme, getCSS } from 'altair-graphql-core/build/theme';

import createEmotion, { Emotion } from '@emotion/css/create-instance';
import { NzConfigService } from 'ng-zorro-antd/core/config';

@Directive({
  selector: '[appTheme]',
  standalone: false,
})
export class ThemeDirective implements OnInit, OnChanges {
  @Input() appTheme: ICustomTheme = {};
  @Input() appDarkTheme: ICustomTheme = {};
  @Input() appAccentColor = '';
  @Input() cspNonce = '';

  private emotionInstance?: Emotion;
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
    return this.getEmotionInstance().css(
      getCSS(appTheme, appDarkTheme, accentColor)
    );
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

  private getEmotionInstance() {
    if (!this.emotionInstance) {
      this.emotionInstance = createEmotion({
        key: 'altair-theme',
        nonce: this.cspNonce || undefined,
      });
    }
    return this.emotionInstance;
  }
}
