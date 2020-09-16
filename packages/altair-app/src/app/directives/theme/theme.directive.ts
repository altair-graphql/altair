import { Directive, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { css } from 'emotion';
import { createTheme, ITheme, hexToRgbStr, ICustomTheme } from 'app/services/theme/theme';
import { ThemeRegistryService } from 'app/services';

@Directive({
  selector: '[appTheme]'
})
export class ThemeDirective implements OnInit, OnChanges {

  @Input() appTheme: ICustomTheme;

  private className = '';

  constructor(
    private themeRegistry: ThemeRegistryService
  ) {}

  ngOnInit() {
    this.addHTMLClass(this.appTheme);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.appTheme?.currentValue) {
      this.addHTMLClass(changes.appTheme.currentValue);
    }
  }

  getCssString(theme: ITheme) {
    return `
      --baseline-size: ${theme.type.fontSize.base};
      --rem-base: ${theme.type.fontSize.remBase};
      --body-font-size: ${theme.type.fontSize.body};
      --black-color: ${theme.colors.black};
      --dark-grey-color: ${theme.colors.darkGray};
      --grey-color: ${theme.colors.gray};
      --light-grey-color: ${theme.colors.lightGray};
      --white-color: ${theme.colors.white};
      --green-color: ${theme.colors.green};
      --blue-color: ${theme.colors.blue};
      --cerise-color: ${theme.colors.cerise};
      --red-color: ${theme.colors.red};
      --orange-color: ${theme.colors.orange};
      --yellow-color: ${theme.colors.yellow};
      --light-red-color: ${theme.colors.lightRed};
      --dark-purple-color: ${theme.colors.darkPurple};

      --primary-color: ${theme.colors.primary};
      --secondary-color: ${theme.colors.secondary};

      --shadow-bg: rgba(${hexToRgbStr(theme.shadow.color)}, ${theme.shadow.opacity});

      --rgb-black: ${hexToRgbStr(theme.colors.black)};
      --rgb-dark-grey: ${hexToRgbStr(theme.colors.darkGray)};
      --rgb-grey: ${hexToRgbStr(theme.colors.gray)};
      --rgb-light-grey: ${hexToRgbStr(theme.colors.lightGray)};
      --rgb-white: ${hexToRgbStr(theme.colors.white)};
      --rgb-green: ${hexToRgbStr(theme.colors.green)};
      --rgb-blue: ${hexToRgbStr(theme.colors.blue)};
      --rgb-cerise: ${hexToRgbStr(theme.colors.cerise)};
      --rgb-red: ${hexToRgbStr(theme.colors.red)};
      --rgb-orange: ${hexToRgbStr(theme.colors.orange)};
      --rgb-yellow: ${hexToRgbStr(theme.colors.yellow)};
      --rgb-light-red: ${hexToRgbStr(theme.colors.lightRed)};
      --rgb-dark-purple: ${hexToRgbStr(theme.colors.darkPurple)};

      --editor-font-family: ${theme.editor.fontFamily.default};
      --editor-font-size: ${theme.editor.fontSize};

      --theme-bg-color: ${theme.colors.bg};
      --theme-off-bg-color: ${theme.colors.offBg};
      --theme-font-color: ${theme.colors.font};
      --theme-off-font-color: ${theme.colors.offFont};
      --theme-border-color: ${theme.colors.border};
      --theme-off-border-color: ${theme.colors.offBorder};
      --header-bg-color: ${theme.colors.headerBg || theme.colors.offBg};

      --rgb-primary: ${hexToRgbStr(theme.colors.primary)};
      --rgb-secondary: ${hexToRgbStr(theme.colors.secondary)};

      --rgb-theme-bg: ${hexToRgbStr(theme.colors.bg)};
      --rgb-theme-off-bg: ${hexToRgbStr(theme.colors.offBg)};
      --rgb-theme-font: ${hexToRgbStr(theme.colors.font)};
      --rgb-theme-off-font: ${hexToRgbStr(theme.colors.offFont)};
      --rgb-theme-border: ${hexToRgbStr(theme.colors.border)};
      --rgb-theme-off-border: ${hexToRgbStr(theme.colors.offBorder)};

      --editor-comment-color: ${theme.editor.colors.comment};
      --editor-string-color: ${theme.editor.colors.string};
      --editor-number-color: ${theme.editor.colors.number};
      --editor-variable-color: ${theme.editor.colors.variable};
      --editor-attribute-color: ${theme.editor.colors.attribute};
      --editor-keyword-color: ${theme.editor.colors.keyword};
      --editor-atom-color: ${theme.editor.colors.atom};
      --editor-property-color: ${theme.editor.colors.property};
      --editor-punctuation-color: ${theme.editor.colors.punctuation};
      --editor-cursor-color: ${theme.editor.colors.cursor};
      --editor-def-color: ${theme.editor.colors.definition};
      --editor-builtin-color: ${theme.editor.colors.builtin};
    `;
  }

  getDynamicClassName(appTheme: ICustomTheme) {
    if (!appTheme || appTheme.isSystem) {
      return css(`
        ${this.getCssString(createTheme(this.themeRegistry.getTheme('light')!))}
        @media (prefers-color-scheme: dark) {
          ${this.getCssString(createTheme(this.themeRegistry.getTheme('dark')!))}
        }
      `);
    }

    return css(this.getCssString(createTheme(appTheme)));
  }

  addHTMLClass(appTheme: ICustomTheme) {
    if (this.className) {
      document.documentElement.classList.remove(this.className);
    }

    this.className = this.getDynamicClassName(appTheme);
    document.documentElement.classList.add(this.className);
  }
}
