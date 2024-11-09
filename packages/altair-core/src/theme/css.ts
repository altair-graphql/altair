import lightTheme from './defaults/light';
import darkTheme from './defaults/dark';
import { ICustomTheme, ITheme, createTheme, hexToRgbStr } from './theme';

const COLOR_VARS = {
  // Base colors
  'black-color': (t: ITheme) => t.colors.black,
  'dark-grey-color': (t: ITheme) => t.colors.darkGray,
  'grey-color': (t: ITheme) => t.colors.gray,
  'light-grey-color': (t: ITheme) => t.colors.lightGray,
  'white-color': (t: ITheme) => t.colors.white,
  'green-color': (t: ITheme) => t.colors.green,
  'blue-color': (t: ITheme) => t.colors.blue,
  'cerise-color': (t: ITheme) => t.colors.cerise,
  'red-color': (t: ITheme) => t.colors.red,
  'rose-color': (t: ITheme) => t.colors.rose,
  'orange-color': (t: ITheme) => t.colors.orange,
  'yellow-color': (t: ITheme) => t.colors.yellow,
  'light-red-color': (t: ITheme) => t.colors.lightRed,
  'dark-purple-color': (t: ITheme) => t.colors.darkPurple,

  'primary-color': (t: ITheme) => t.colors.primary,
  'secondary-color': (t: ITheme) => t.colors.secondary,
  'tertiary-color': (t: ITheme) => t.colors.tertiary,

  'theme-bg-color': (t: ITheme) => t.colors.bg,
  'theme-off-bg-color': (t: ITheme) => t.colors.offBg,
  'theme-font-color': (t: ITheme) => t.colors.font,
  'theme-off-font-color': (t: ITheme) => t.colors.offFont,
  'theme-border-color': (t: ITheme) => t.colors.border,
  'theme-off-border-color': (t: ITheme) => t.colors.offBorder,
  'header-bg-color': (t: ITheme) => t.colors.headerBg || t.colors.offBg,

  'editor-comment-color': (t: ITheme) => t.editor.colors.comment,
  'editor-string-color': (t: ITheme) => t.editor.colors.string,
  'editor-number-color': (t: ITheme) => t.editor.colors.number,
  'editor-variable-color': (t: ITheme) => t.editor.colors.variable,
  'editor-attribute-color': (t: ITheme) => t.editor.colors.attribute,
  'editor-keyword-color': (t: ITheme) => t.editor.colors.keyword,
  'editor-atom-color': (t: ITheme) => t.editor.colors.atom,
  'editor-property-color': (t: ITheme) => t.editor.colors.property,
  'editor-punctuation-color': (t: ITheme) => t.editor.colors.punctuation,
  'editor-cursor-color': (t: ITheme) => t.editor.colors.cursor,
  'editor-def-color': (t: ITheme) => t.editor.colors.definition,
  'editor-builtin-color': (t: ITheme) => t.editor.colors.builtin,
} as const;

const RGB_VARS = {
  'rgb-black': (t: ITheme) => hexToRgbStr(t.colors.black),
  'rgb-dark-grey': (t: ITheme) => hexToRgbStr(t.colors.darkGray),
  'rgb-grey': (t: ITheme) => hexToRgbStr(t.colors.gray),
  'rgb-light-grey': (t: ITheme) => hexToRgbStr(t.colors.lightGray),
  'rgb-white': (t: ITheme) => hexToRgbStr(t.colors.white),
  'rgb-green': (t: ITheme) => hexToRgbStr(t.colors.green),
  'rgb-blue': (t: ITheme) => hexToRgbStr(t.colors.blue),
  'rgb-cerise': (t: ITheme) => hexToRgbStr(t.colors.cerise),
  'rgb-red': (t: ITheme) => hexToRgbStr(t.colors.red),
  'rgb-rose': (t: ITheme) => hexToRgbStr(t.colors.rose),
  'rgb-orange': (t: ITheme) => hexToRgbStr(t.colors.orange),
  'rgb-yellow': (t: ITheme) => hexToRgbStr(t.colors.yellow),
  'rgb-light-red': (t: ITheme) => hexToRgbStr(t.colors.lightRed),
  'rgb-dark-purple': (t: ITheme) => hexToRgbStr(t.colors.darkPurple),

  'rgb-primary': (t: ITheme) => hexToRgbStr(t.colors.primary),
  'rgb-secondary': (t: ITheme) => hexToRgbStr(t.colors.secondary),
  'rgb-tertiary': (t: ITheme) => hexToRgbStr(t.colors.tertiary),

  'rgb-theme-bg': (t: ITheme) => hexToRgbStr(t.colors.bg),
  'rgb-theme-off-bg': (t: ITheme) => hexToRgbStr(t.colors.offBg),
  'rgb-theme-font': (t: ITheme) => hexToRgbStr(t.colors.font),
  'rgb-theme-off-font': (t: ITheme) => hexToRgbStr(t.colors.offFont),
  'rgb-theme-border': (t: ITheme) => hexToRgbStr(t.colors.border),
  'rgb-theme-off-border': (t: ITheme) => hexToRgbStr(t.colors.offBorder),
  'rgb-header-bg': (t: ITheme) => hexToRgbStr(t.colors.headerBg || t.colors.offBg),
  // ... other rgb values
} as const;

const createVars = (mapping: Record<string, (t: ITheme) => string>, theme: ITheme) =>
  Object.entries(mapping)
    .map(([key, getValue]) => `--${key}: ${getValue(theme)};`)
    .join('\n    ');

const asCSSVariablesString = (theme: ITheme) => {
  return `
  :root {
    --shadow-bg: rgba(${hexToRgbStr(theme.shadow.color)}, ${theme.shadow.opacity});

    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 'Helvetica Neue', Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

    --editor-font-family: ${theme.editor.fontFamily.default};
    --editor-font-size: ${theme.editor.fontSize};

    --baseline-size: ${theme.type.fontSize.base};
    --rem-base: ${theme.type.fontSize.remBase};
    --body-font-size: ${theme.type.fontSize.body};

    --app-easing: ${theme.easing};

    ${createVars(COLOR_VARS, theme)}
    ${createVars(RGB_VARS, theme)}
  }
  `;
};

export const getCSS = (
  appTheme: ICustomTheme,
  appDarkTheme?: ICustomTheme,
  accentColor?: string
) => {
  const extraTheme = accentColor ? { colors: { primary: accentColor } } : {};
  if (appTheme && appDarkTheme) {
    return `
      ${asCSSVariablesString(createTheme(appTheme, extraTheme))}
      @media (prefers-color-scheme: dark) {
        ${asCSSVariablesString(createTheme(appDarkTheme, extraTheme))}
      }
    `;
  }

  if (!appTheme || appTheme.isSystem) {
    return `
      ${asCSSVariablesString(createTheme(lightTheme, appTheme, extraTheme))}
      @media (prefers-color-scheme: dark) {
        ${asCSSVariablesString(createTheme(darkTheme, appTheme, extraTheme))}
      }
    `;
  }

  return asCSSVariablesString(createTheme(appTheme, extraTheme));
};
