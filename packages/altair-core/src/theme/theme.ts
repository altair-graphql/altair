import deepmerge from 'deepmerge';
import colors from 'color-name';

/*
Some theming ideas:
#1a1c24 - A deep charcoal gray with a subtle blue undertone.
#181a1f - A very dark gray with a cool, slightly bluish tint.
#212529 - A dark cool gray with a hint of blue.
#232931 - A rich, deep blue-gray shade that pairs well with greens.
#2d2f33 - A slightly lighter dark gray with a subtle blue cast.

If the background color is #1a1c24 (deep charcoal gray), you could use #2d3138 for borders.
For a #181a1f (very dark gray) background, consider #262a2e for borders.
With a #212529 (dark cool gray) background, #343a40 would make a good border color.
If you choose #232931 (rich blue-gray) as the background, #3a4149 would be a suitable border shade.
For a #2d2f33 (slightly lighter dark gray) background, #404448 could work well for borders.
*/

export const foundations = {
  easing: 'ease',
  colors: {
    black: '#201e1f',
    darkGray: '#a6a6a6',
    gray: '#eaeaea',
    lightGray: '#fafafa',
    white: '#ffffff',
    green: '#64CB29',
    blue: '#2d9ee0',
    rose: '#f45b69',
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
      body: 13,
      bodySmaller: 12,
    },
    fontFamily: {
      default:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
  },
};

export interface ITheme {
  /** CSS transition easing function for smooth animations */
  easing: string;
  colors: {
    // Foundation colors - Base palette used throughout the theme
    /** Black color used for high contrast elements. Used as text color in light themes and background in dark themes. */
    black: string;
    /** Dark gray color for muted text and secondary elements. Commonly used for comments in code editor. */
    darkGray: string;
    /** Medium gray color for neutral backgrounds and borders. Used for subtle UI separators. */
    gray: string;
    /** Light gray color for subtle backgrounds and dividers. Used for hover states and inactive backgrounds. */
    lightGray: string;
    /** White color for light backgrounds and text. Used as background in light themes and text in dark themes. */
    white: string;
    /** Green color typically used for success states and positive actions. Default primary color. */
    green: string;
    /** Blue color for informational elements and links. Default secondary color and used for keywords in editor. */
    blue: string;
    /** Rose/pink color for accent elements and highlights. Default tertiary color. */
    rose: string;
    /** Bright magenta/cerise color for special emphasis. Used for error messages and warnings. */
    cerise: string;
    /** Red color for error states and destructive actions. Used in error messages and alerts. */
    red: string;
    /** Orange color for warning states and secondary actions. Used for strings and numbers in code editor. */
    orange: string;
    /** Yellow color for caution states and highlights. Used for warning messages. */
    yellow: string;
    /** Light red/salmon color for subtle error indicators. Used for muted error states. */
    lightRed: string;
    /** Dark purple color for premium features or special elements. Used for special UI accents. */
    darkPurple: string;

    // Brand colors - Main theme colors used for interactive elements
    /** 
     * Primary brand color used for main interactive elements.
     * Controls: Primary buttons, active tabs, main action buttons, focus indicators, checkboxes.
     * CSS Variable: --primary-color
     */
    primary: string;
    /** 
     * Secondary brand color used for supporting interactive elements.
     * Controls: Secondary buttons, links, informational icons.
     * CSS Variable: --secondary-color
     */
    secondary: string;
    /** 
     * Tertiary brand color used for accent and decorative elements.
     * Controls: Accent highlights, badges, decorative UI elements.
     * CSS Variable: --tertiary-color
     */
    tertiary: string;

    // Background colors - Control the main surface colors
    /** 
     * Main background color for the application.
     * Controls: Main app background, primary content areas, modal backgrounds.
     * CSS Variable: --theme-bg-color
     */
    bg: string;
    /** 
     * Alternative background color for cards, panels, and sections.
     * Controls: Sidebar background, header background, panel backgrounds, elevated surfaces.
     * This creates depth and visual hierarchy by contrasting with bg.
     * CSS Variable: --theme-off-bg-color
     */
    offBg: string;
    /** 
     * Primary text color for readable content.
     * Controls: Main body text, headings, labels, primary readable content.
     * Should have high contrast with bg color.
     * CSS Variable: --theme-font-color
     */
    font: string;
    /** 
     * Secondary text color for less emphasized content.
     * Controls: Helper text, timestamps, secondary labels, muted text.
     * Should be readable but less prominent than font.
     * CSS Variable: --theme-off-font-color
     */
    offFont: string;
    /** 
     * Primary border color for main UI elements.
     * Controls: Input borders, card borders, dividers, main UI separators.
     * CSS Variable: --theme-border-color
     */
    border: string;
    /** 
     * Secondary border color for subtle divisions.
     * Controls: Subtle dividers, inactive borders, background separators.
     * Should be more subtle than border.
     * CSS Variable: --theme-off-border-color
     */
    offBorder: string;

    /** 
     * Background color specifically for the header section.
     * Controls: Top header bar background. Defaults to offBg if not specified.
     * CSS Variable: --header-bg-color
     */
    headerBg: string;
  };
  type: {
    fontSize: {
      /** Base font size in pixels used for calculations */
      base: number;
      /** Root em base size in pixels for responsive typography */
      remBase: number;
      /** Standard body text font size */
      body: number;
      /** Smaller body text font size for secondary content */
      bodySmaller: number;
    };
    fontFamily: {
      /** Default system font stack for UI elements */
      default: string;
    };
  };
  /** Whether this theme follows system preferences (light/dark mode) */
  isSystem: boolean;
  shadow: {
    /** Color used for drop shadows and elevation effects */
    color: string;
    /** Opacity level for shadow effects (0.0 to 1.0) */
    opacity: number;
  };
  editor: {
    fontFamily: {
      /** 
       * Font family specifically for code editor and monospace content.
       * Controls: GraphQL query editor, variables editor, headers editor, response viewer.
       * CSS Variable: --editor-font-family
       */
      default: string;
    };
    /** 
     * Font size for code editor text.
     * Controls: Text size in all code editors (query, variables, headers, response).
     * CSS Variable: --editor-font-size
     */
    fontSize: number;
    colors: {
      /** 
       * Color for code comments and documentation.
       * In GraphQL: # comment lines
       * CSS Variable: --editor-comment-color
       */
      comment: string;
      /** 
       * Color for string literals in code.
       * In GraphQL: "string values", argument values
       * CSS Variable: --editor-string-color
       */
      string: string;
      /** 
       * Color for numeric literals in code.
       * In GraphQL: 123, 45.67, numeric values
       * CSS Variable: --editor-number-color
       */
      number: string;
      /** 
       * Color for variable names and identifiers.
       * In GraphQL: $variableName, field names, type names
       * CSS Variable: --editor-variable-color
       */
      variable: string;
      /** 
       * Color for programming language keywords.
       * In GraphQL: query, mutation, subscription, fragment, on
       * CSS Variable: --editor-keyword-color
       */
      keyword: string;
      /** 
       * Color for atomic values like boolean literals.
       * In GraphQL: true, false, null
       * CSS Variable: --editor-atom-color
       */
      atom: string;
      /** 
       * Color for HTML/XML/GraphQL attributes.
       * In GraphQL: directive names like @include, @skip
       * CSS Variable: --editor-attribute-color
       */
      attribute: string;
      /** 
       * Color for object properties and field names.
       * In GraphQL: field names in queries and responses
       * CSS Variable: --editor-property-color
       */
      property: string;
      /** 
       * Color for punctuation marks like brackets and commas.
       * In GraphQL: { } [ ] ( ) , : punctuation marks
       * CSS Variable: --editor-punctuation-color
       */
      punctuation: string;
      /** 
       * Color for function, class, type definitions.
       * In GraphQL: Type definitions, operation names
       * CSS Variable: --editor-def-color
       */
      definition: string;
      /** 
       * Color for built-in functions and types.
       * In GraphQL: Built-in scalar types (String, Int, Boolean, etc.)
       * CSS Variable: --editor-builtin-color
       */
      builtin: string;
      /** 
       * Color for the text cursor in the editor.
       * Controls: Blinking cursor position indicator
       * CSS Variable: --editor-cursor-color
       */
      cursor: string;
    };
  };
}

const theme: ITheme = deepmerge(foundations, {
  isSystem: false,
  colors: {
    primary: foundations.colors.green,
    secondary: foundations.colors.blue,
    tertiary: foundations.colors.rose,

    bg: foundations.colors.lightGray,
    offBg: foundations.colors.white,
    font: foundations.colors.black,
    offFont: foundations.colors.darkGray,
    border: foundations.colors.darkGray,
    offBorder: foundations.colors.gray,

    headerBg: foundations.colors.white,
  },
  shadow: {
    color: foundations.colors.black,
    opacity: 0.1,
  },
  editor: {
    fontFamily: {
      default: 'JetBrains Mono',
    },
    fontSize: foundations.type.fontSize.bodySmaller,
    colors: {
      comment: foundations.colors.darkGray,
      string: foundations.colors.orange,
      number: foundations.colors.orange,
      variable: foundations.colors.black,
      keyword: foundations.colors.blue,
      atom: foundations.colors.black,
      attribute: foundations.colors.green,
      property: foundations.colors.blue,
      punctuation: foundations.colors.blue,
      definition: foundations.colors.orange,
      builtin: foundations.colors.orange,
      cursor: foundations.colors.blue,
    },
  },
});

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

export type ICustomTheme = RecursivePartial<ITheme>;

interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

const colorOrHexToRgb = (hex: string): RGBA | undefined => {
  const rgb = colors[hex as keyof typeof colors];
  if (rgb) {
    return {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
    };
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result || result.length < 4) {
    return;
  }

  return {
    r: parseInt(result[1] ?? '', 16),
    g: parseInt(result[2] ?? '', 16),
    b: parseInt(result[3] ?? '', 16),
  };
};

export const hexToRgbStr = (hex: string) => {
  if (!hex) {
    return '';
  }

  const rgb = colorOrHexToRgb(hex);
  if (!rgb) {
    return '';
  }

  const { r, g, b } = rgb;

  return `${r}, ${g}, ${b}`;
};

// shade one of our rgb color objects to a distance of i*10%
// ({ red: 80, green: 18, blue: 20 }, 1) => { red: 72, green: 16, blue: 18 }
const rgbShade = (rgb: RGBA, i: number) => {
  return {
    r: rgb.r * (1 - 0.1 * i),
    g: rgb.g * (1 - 0.1 * i),
    b: rgb.b * (1 - 0.1 * i),
  };
};

// tint one of our rgb color objects to a distance of i*10%
// ({ red: 80, green: 18, blue: 20 }, 1) => { red: 98, green: 42, blue: 44 }
const rgbTint = (rgb: RGBA, i: number) => {
  return {
    r: rgb.r + (255 - rgb.r) * i * 0.1,
    g: rgb.g + (255 - rgb.g) * i * 0.1,
    b: rgb.b + (255 - rgb.b) * i * 0.1,
  };
};

export const mergeThemes = (...customThemes: ICustomTheme[]): ICustomTheme => {
  return deepmerge.all(customThemes);
};

export const createTheme = (
  customTheme: ICustomTheme,
  ...extraThemes: ICustomTheme[]
): ITheme => {
  return deepmerge.all([theme, customTheme, ...extraThemes]) as ITheme;
};
