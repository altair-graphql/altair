import lightTheme from './defaults/light';
import darkTheme from './defaults/dark';
import { ICustomTheme, ITheme, createTheme, hexToRgbStr } from './theme';

const COLOR_VARS = {
  // Base colors
  'black-color': (t: ITheme) => t['color.black'],
  'dark-grey-color': (t: ITheme) => t['color.darkGray'],
  'grey-color': (t: ITheme) => t['color.gray'],
  'light-grey-color': (t: ITheme) => t['color.lightGray'],
  'white-color': (t: ITheme) => t['color.white'],
  'green-color': (t: ITheme) => t['color.green'],
  'blue-color': (t: ITheme) => t['color.blue'],
  'cerise-color': (t: ITheme) => t['color.cerise'],
  'red-color': (t: ITheme) => t['color.red'],
  'rose-color': (t: ITheme) => t['color.rose'],
  'orange-color': (t: ITheme) => t['color.orange'],
  'yellow-color': (t: ITheme) => t['color.yellow'],
  'light-red-color': (t: ITheme) => t['color.lightRed'],
  'dark-purple-color': (t: ITheme) => t['color.darkPurple'],

  'primary-color': (t: ITheme) => t['color.primary'],
  'secondary-color': (t: ITheme) => t['color.secondary'],
  'tertiary-color': (t: ITheme) => t['color.tertiary'],

  'theme-bg-color': (t: ITheme) => t['color.bg'],
  'theme-off-bg-color': (t: ITheme) => t['color.offBg'],
  'theme-font-color': (t: ITheme) => t['color.font'],
  'theme-off-font-color': (t: ITheme) => t['color.offFont'],
  'theme-border-color': (t: ITheme) => t['color.border'],
  'theme-off-border-color': (t: ITheme) => t['color.offBorder'],
  'header-bg-color': (t: ITheme) => t['color.headerBg'] || t['color.offBg'],

  'editor-comment-color': (t: ITheme) => t['color.editor.comment'],
  'editor-string-color': (t: ITheme) => t['color.editor.string'],
  'editor-number-color': (t: ITheme) => t['color.editor.number'],
  'editor-variable-color': (t: ITheme) => t['color.editor.variable'],
  'editor-attribute-color': (t: ITheme) => t['color.editor.attribute'],
  'editor-keyword-color': (t: ITheme) => t['color.editor.keyword'],
  'editor-atom-color': (t: ITheme) => t['color.editor.atom'],
  'editor-property-color': (t: ITheme) => t['color.editor.property'],
  'editor-punctuation-color': (t: ITheme) => t['color.editor.punctuation'],
  'editor-cursor-color': (t: ITheme) => t['color.editor.cursor'],
  'editor-def-color': (t: ITheme) => t['color.editor.definition'],
  'editor-builtin-color': (t: ITheme) => t['color.editor.builtin'],
} as const;

const RGB_VARS = {
  'rgb-black': (t: ITheme) => hexToRgbStr(t['color.black']),
  'rgb-dark-grey': (t: ITheme) => hexToRgbStr(t['color.darkGray']),
  'rgb-grey': (t: ITheme) => hexToRgbStr(t['color.gray']),
  'rgb-light-grey': (t: ITheme) => hexToRgbStr(t['color.lightGray']),
  'rgb-white': (t: ITheme) => hexToRgbStr(t['color.white']),
  'rgb-green': (t: ITheme) => hexToRgbStr(t['color.green']),
  'rgb-blue': (t: ITheme) => hexToRgbStr(t['color.blue']),
  'rgb-cerise': (t: ITheme) => hexToRgbStr(t['color.cerise']),
  'rgb-red': (t: ITheme) => hexToRgbStr(t['color.red']),
  'rgb-rose': (t: ITheme) => hexToRgbStr(t['color.rose']),
  'rgb-orange': (t: ITheme) => hexToRgbStr(t['color.orange']),
  'rgb-yellow': (t: ITheme) => hexToRgbStr(t['color.yellow']),
  'rgb-light-red': (t: ITheme) => hexToRgbStr(t['color.lightRed']),
  'rgb-dark-purple': (t: ITheme) => hexToRgbStr(t['color.darkPurple']),

  'rgb-primary': (t: ITheme) => hexToRgbStr(t['color.primary']),
  'rgb-secondary': (t: ITheme) => hexToRgbStr(t['color.secondary']),
  'rgb-tertiary': (t: ITheme) => hexToRgbStr(t['color.tertiary']),

  'rgb-theme-bg': (t: ITheme) => hexToRgbStr(t['color.bg']),
  'rgb-theme-off-bg': (t: ITheme) => hexToRgbStr(t['color.offBg']),
  'rgb-theme-font': (t: ITheme) => hexToRgbStr(t['color.font']),
  'rgb-theme-off-font': (t: ITheme) => hexToRgbStr(t['color.offFont']),
  'rgb-theme-border': (t: ITheme) => hexToRgbStr(t['color.border']),
  'rgb-theme-off-border': (t: ITheme) => hexToRgbStr(t['color.offBorder']),
  'rgb-header-bg': (t: ITheme) =>
    hexToRgbStr(t['color.headerBg'] || t['color.offBg']),
  // ... other rgb values
} as const;

const createVars = (mapping: Record<string, (t: ITheme) => string>, theme: ITheme) =>
  Object.entries(mapping)
    .map(([key, getValue]) => `--${key}: ${getValue(theme)};`)
    .join('\n    ');

const asCSSVariablesString = (theme: ITheme) => {
  return `
  :root {
    --shadow-bg: rgba(${hexToRgbStr(theme['shadow.color'])}, ${theme['shadow.opacity']});

    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 'Helvetica Neue', Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

    --editor-font-family: ${theme['fontFamily.code']};
    --editor-font-size: ${theme['fontSize.code']};

    --baseline-size: ${theme['fontSize.base']};
    --rem-base: ${theme['fontSize.remBase']};
    --body-font-size: ${theme['fontSize.body']};

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
  const extraTheme: ICustomTheme = accentColor
    ? {
        'color.primary': accentColor,
      }
    : {};
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
