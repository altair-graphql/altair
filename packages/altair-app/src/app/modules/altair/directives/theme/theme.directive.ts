import { Directive, input, effect, inject } from '@angular/core';
import { ICustomTheme, getCSS } from 'altair-graphql-core/build/theme';

import createEmotion, { Emotion } from '@emotion/css/create-instance';
import { NzConfigService } from 'ng-zorro-antd/core/config';

@Directive({
  selector: '[appTheme]',
  standalone: false,
})
export class ThemeDirective {
  private nzConfigService = inject(NzConfigService);

  readonly appTheme = input<ICustomTheme>({});
  readonly appDarkTheme = input<ICustomTheme>({});
  readonly appAccentColor = input<string>('');
  readonly cspNonce = input<string>('');

  private emotionInstance?: Emotion;
  private className = '';

  constructor() {
    effect(() => {
      this.applyTheme(this.appTheme(), this.appDarkTheme(), this.appAccentColor());
    });
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
        nonce: this.cspNonce() || undefined,
      });
    }
    return this.emotionInstance;
  }
}
