import deepmerge from 'deepmerge';
import colors from 'color-name';
import { boolean, input, number, object, output, string } from 'zod/v4';

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

export const foundationColors = {
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
};

const defaultValues = {
  easing: 'ease',
  isSystem: false,
  colors: deepmerge(foundationColors, {
    primary: foundationColors.green,
    secondary: foundationColors.blue,
    tertiary: foundationColors.rose,

    bg: foundationColors.lightGray,
    offBg: foundationColors.white,
    font: foundationColors.black,
    offFont: foundationColors.darkGray,
    border: foundationColors.darkGray,
    offBorder: foundationColors.gray,

    headerBg: foundationColors.white,
  }),

  shadow: {
    color: foundationColors.black,
    opacity: 0.1,
  },
  editor: {
    fontFamily: {
      default: 'JetBrains Mono',
    },
    fontSize: 12,
    colors: {
      comment: foundationColors.darkGray,
      string: foundationColors.orange,
      number: foundationColors.orange,
      variable: foundationColors.black,
      keyword: foundationColors.blue,
      atom: foundationColors.black,
      attribute: foundationColors.green,
      property: foundationColors.blue,
      punctuation: foundationColors.blue,
      definition: foundationColors.orange,
      builtin: foundationColors.orange,
      cursor: foundationColors.blue,
    },
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
const colorsSchema = object({
  /**
   * Black color used for high contrast elements
   */
  black: string()
    .meta({
      description: 'Black color used for high contrast elements',
    })
    .default(defaultValues.colors.black),
  /**
   * Dark gray color for muted text and secondary elements
   */
  darkGray: string()
    .meta({
      description: 'Dark gray color for muted text and secondary elements',
    })
    .default(defaultValues.colors.darkGray),
  /**
   * Medium gray color for neutral backgrounds and borders
   */
  gray: string()
    .meta({
      description: 'Medium gray color for neutral backgrounds and borders',
    })
    .default(defaultValues.colors.gray),
  /**
   * Light gray color for subtle backgrounds and dividers
   */
  lightGray: string()
    .meta({
      description: 'Light gray color for subtle backgrounds and dividers',
    })
    .default(defaultValues.colors.lightGray),
  /**
   * White color for light backgrounds and text
   */
  white: string()
    .meta({
      description: 'White color for light backgrounds and text',
    })
    .default(defaultValues.colors.white),
  /**
   * Green color typically used for success states and positive actions
   */
  green: string()
    .meta({
      description:
        'Green color typically used for success states and positive actions',
    })
    .default(defaultValues.colors.green),
  /**
   * Blue color for informational elements and links
   */
  blue: string()
    .meta({
      description: 'Blue color for informational elements and links',
    })
    .default(defaultValues.colors.blue),
  /**
   * Rose/pink color for accent elements and highlights
   */
  rose: string()
    .meta({
      description: 'Rose/pink color for accent elements and highlights',
    })
    .default(defaultValues.colors.rose),
  /**
   * Bright magenta/cerise color for special emphasis
   */
  cerise: string()
    .meta({
      description: 'Bright magenta/cerise color for special emphasis',
    })
    .default(defaultValues.colors.cerise),
  /**
   * Red color for error states and destructive actions
   */
  red: string()
    .meta({
      description: 'Red color for error states and destructive actions',
    })
    .default(defaultValues.colors.red),
  /**
   * Orange color for warning states and secondary actions
   */
  orange: string()
    .meta({
      description: 'Orange color for warning states and secondary actions',
    })
    .default(defaultValues.colors.orange),
  /**
   * Yellow color for caution states and highlights
   */
  yellow: string()
    .meta({
      description: 'Yellow color for caution states and highlights',
    })
    .default(defaultValues.colors.yellow),
  /**
   * Light red/salmon color for subtle error indicators
   */
  lightRed: string()
    .meta({
      description: 'Light red/salmon color for subtle error indicators',
    })
    .default(defaultValues.colors.lightRed),
  /**
   * Dark purple color for premium features or special elements
   */
  darkPurple: string()
    .meta({
      description: 'Dark purple color for premium features or special elements',
    })
    .default(defaultValues.colors.darkPurple),

  /**
   * Primary brand color used for main interactive elements
   */
  primary: string()
    .meta({
      description: 'Primary brand color used for main interactive elements',
    })
    .default(defaultValues.colors.primary),
  /**
   * Secondary brand color used for supporting interactive elements
   */
  secondary: string()
    .meta({
      description: 'Secondary brand color used for supporting interactive elements',
    })
    .default(defaultValues.colors.secondary),
  /**
   * Tertiary brand color used for accent and decorative elements
   */
  tertiary: string()
    .meta({
      description: 'Tertiary brand color used for accent and decorative elements',
    })
    .default(defaultValues.colors.tertiary),
  /**
   * Main background color for the application
   */
  bg: string()
    .meta({ description: 'Main background color for the application' })
    .default(defaultValues.colors.bg),
  /**
   * Alternative background color for cards, panels, and sections
   */
  offBg: string()
    .meta({
      description: 'Alternative background color for cards, panels, and sections',
    })
    .default(defaultValues.colors.offBg),
  /**
   * Primary text color for readable content
   */
  font: string()
    .meta({ description: 'Primary text color for readable content' })
    .default(defaultValues.colors.font),
  /**
   * Secondary text color for less emphasized content
   */
  offFont: string()
    .meta({
      description: 'Secondary text color for less emphasized content',
    })
    .default(defaultValues.colors.offFont),
  /**
   * Primary border color for main UI elements
   */
  border: string()
    .meta({
      description: 'Primary border color for main UI elements',
    })
    .default(defaultValues.colors.border),
  /**
   * Secondary border color for subtle divisions
   */
  offBorder: string()
    .meta({
      description: 'Secondary border color for subtle divisions',
    })
    .default(defaultValues.colors.offBorder),

  /**
   * Background color specifically for the header section
   */
  headerBg: string()
    .meta({
      description: 'Background color specifically for the header section',
    })
    .default(defaultValues.colors.headerBg),
});
const typeSchema = object({
  fontSize: object({
    /**
     * Base font size in pixels used for calculations
     */
    base: number()
      .meta({
        description: 'Base font size in pixels used for calculations',
      })
      .default(defaultValues.type.fontSize.base),
    /**
     * Root em base size in pixels for responsive typography
     */
    remBase: number()
      .meta({
        description: 'Root em base size in pixels for responsive typography',
      })
      .default(defaultValues.type.fontSize.remBase),
    /**
     * Standard body text font size
     */
    body: number()
      .meta({ description: 'Standard body text font size' })
      .default(defaultValues.type.fontSize.body),
    /**
     * Smaller body text font size for secondary content
     */
    bodySmaller: number()
      .meta({
        description: 'Smaller body text font size for secondary content',
      })
      .default(defaultValues.type.fontSize.bodySmaller),
  }),
  fontFamily: object({
    /**
     * Default system font stack for UI elements
     */
    default: string()
      .meta({
        description: 'Default system font stack for UI elements',
      })
      .default(defaultValues.type.fontFamily.default),
  }).default(defaultValues.type.fontFamily),
});
const editorThemeSchema = object({
  fontFamily: object({
    /**
     * Font family specifically for code editor and monospace content
     */
    default: string()
      .meta({
        description:
          'Font family specifically for code editor and monospace content',
      })
      .default(defaultValues.editor.fontFamily.default),
  }).default(defaultValues.editor.fontFamily),
  /**
   * Font size for code editor text
   */
  fontSize: number()
    .meta({
      description: 'Font size for code editor text',
    })
    .default(defaultValues.type.fontSize.bodySmaller),
  colors: object({
    /**
     * Color for code comments and documentation
     */
    comment: string()
      .meta({
        description: 'Color for code comments and documentation',
      })
      .default(defaultValues.colors.darkGray),
    /**
     * Color for string literals in code
     */
    string: string()
      .meta({ description: 'Color for string literals in code' })
      .default(defaultValues.colors.orange),
    /**
     * Color for numeric literals in code
     */
    number: string()
      .meta({ description: 'Color for numeric literals in code' })
      .default(defaultValues.colors.orange),
    /**
     * Color for variable names and identifiers
     */
    variable: string()
      .meta({
        description: 'Color for variable names and identifiers',
      })
      .default(defaultValues.colors.black),
    /**
     * Color for programming language keywords
     */
    keyword: string()
      .meta({
        description: 'Color for programming language keywords',
      })
      .default(defaultValues.colors.blue),
    /**
     * Color for atomic values like boolean literals
     */
    atom: string()
      .meta({
        description: 'Color for atomic values like boolean literals',
      })
      .default(defaultValues.colors.black),
    /**
     * Color for HTML/XML/GraphQL attributes
     */
    attribute: string()
      .meta({
        description: 'Color for HTML/XML/GraphQL attributes',
      })
      .default(defaultValues.colors.green),
    /**
     * Color for properties
     */
    property: string()
      .meta({ description: 'Color for properties' })
      .default(defaultValues.colors.blue),
    /**
     * Color for punctuation marks like brackets and commas
     */
    punctuation: string()
      .meta({
        description: 'Color for punctuation marks like brackets and commas',
      })
      .default(defaultValues.colors.blue),
    /**
     * Color for function, class, type definitions
     */
    definition: string()
      .meta({
        description: 'Color for function, class, type definitions',
      })
      .default(defaultValues.colors.orange),
    /**
     * Color for built-in functions and types
     */
    builtin: string()
      .meta({
        description: 'Color for built-in functions and types',
      })
      .default(defaultValues.colors.orange),
    /**
     * Color for the text cursor in the editor
     */
    cursor: string()
      .meta({
        description: 'Color for the text cursor in the editor',
      })
      .default(defaultValues.colors.blue),
  }).default(defaultValues.editor.colors),
});
export const themeSchema = object({
  /**
   * CSS transition easing function for smooth animations
   */
  easing: string()
    .meta({
      description: 'CSS transition easing function for smooth animations',
    })
    .default(defaultValues.easing),
  colors: colorsSchema.default(defaultValues.colors),
  type: typeSchema.default(defaultValues.type),
  /**
   * Whether this theme follows system preferences (light/dark mode)
   */
  isSystem: boolean()
    .meta({
      description: 'Whether this theme follows system preferences (light/dark mode)',
    })
    .default(false),
  shadow: object({
    /**
     * Color used for drop shadows and elevation effects
     */
    color: string()
      .meta({
        description: 'Color used for drop shadows and elevation effects',
      })
      .default(defaultValues.colors.black),
    /**
     * Opacity level for shadow effects (0.0 to 1.0)
     */
    opacity: number()
      .meta({
        description: 'Opacity level for shadow effects (0.0 to 1.0)',
      })
      .min(0)
      .max(1)
      .default(0.1),
  }).default(defaultValues.shadow),
  editor: editorThemeSchema.default(defaultValues.editor),
});

export type ITheme = output<typeof themeSchema>;

const theme: ITheme = themeSchema.parse({});

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

export const partialThemeSchema = themeSchema.partial();
export type ICustomTheme = input<typeof themeSchema>;

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

export const mergeThemes = (...customThemes: ICustomTheme[]): ICustomTheme => {
  return deepmerge.all(customThemes) as ICustomTheme;
};

export const createTheme = (
  customTheme: ICustomTheme,
  ...extraThemes: ICustomTheme[]
): ITheme => {
  return deepmerge.all([defaultValues, customTheme, ...extraThemes]) as ITheme;
};
