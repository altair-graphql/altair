import * as deepmerge from 'deepmerge';

export const foundations = {
  easing: 'ease',
  colors: {
    black: '#33363b',
    darkGray: '#a6a6a6',
    gray: '#eaeaea',
    lightGray: '#f0f0f0',
    white: '#ffffff',
    green: '#7ebc59',
    blue: '#368cbf',
    cerise: '#f00faa',
    red: '#ed6a5a',
    orange: '#edae49',
    yellow: '#e4ce44',
    lightRed: '#cc998d',
    darkPurple: '#303965',
  },
  type: {
    fontSize: {
      base: 24,
      remBase: 24,
      body: 14,
    },
    fontFamily: {
      default: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
  },
};

const theme = deepmerge(foundations, {
  isSystem: false,
  colors: {
    primary: foundations.colors.green,
    secondary: foundations.colors.blue,

    bg: foundations.colors.white,
    offBg: foundations.colors.lightGray,
    font: foundations.colors.black,
    offFont: foundations.colors.darkGray,
    border: foundations.colors.gray,
    offBorder: foundations.colors.lightGray,

    headerBg: foundations.colors.white,
  },
  shadow: {
    color: foundations.colors.black,
    opacity: .1,
  },
  editor: {
    fontFamily: {
      default: 'inherit',
    },
    fontSize: foundations.type.fontSize.body,
    colors: {
      comment: foundations.colors.darkGray,
      string: foundations.colors.orange,
      number: foundations.colors.orange,
      variable: foundations.colors.black, // var(--theme-font-color);
      keyword: foundations.colors.blue,
      atom: foundations.colors.black, // var(--theme-font-color);
      attribute: foundations.colors.green,
      property: foundations.colors.blue,
      punctuation: foundations.colors.blue,
      definition: foundations.colors.orange,
      builtin: foundations.colors.orange,
      cursor: foundations.colors.blue,
    },
  }
});

type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
};

export type ITheme = typeof theme;
export type ICustomTheme = RecursivePartial<ITheme>;

const colorToRGBA = (color: string) => {
  const fromHex = hexToRgb(color);

  if (fromHex) {
    return fromHex;
  }

  // Strip everything except the integers eg. "rgb(" and ")" and " "
  const rgbStr = color.split(/\(([^)]+)\)/)[1].replace(/ /g, '');

  // map RGB values to variables
  const r = parseInt(rgbStr.split(',')[0], 10);
  const g = parseInt(rgbStr.split(',')[1], 10);
  const b = parseInt(rgbStr.split(',')[2], 10);
  const a = typeof rgbStr.split(',')[3] !== null ? parseInt(rgbStr.split(',')[3], 10) : undefined;

  return { r, g, b, a };
};

const contrast = (color = '') => {

  // map RGB values to variables
  const { r, g, b } = colorToRGBA(color);

  // calculate contrast of color (standard grayscale algorithmic formula)
  return (Math.round(r * 299) + Math.round(g * 587) + Math.round(b * 114)) / 1000;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : undefined;
}

export const hexToRgbStr = (hex: string) => {
  if (!hex) {
    return '';
  }

  const rgb = hexToRgb(hex);
  if (!rgb) {
    return '';
  }

  const { r, g, b } = rgb;

  return `${r}, ${g}, ${b}`;
};

export const mergeThemes = (...customThemes: ICustomTheme[]): ICustomTheme => {
  return deepmerge.all(customThemes);
};

export const createTheme = (customTheme: ICustomTheme): ITheme => {
  return deepmerge(theme, customTheme) as ITheme;
};
