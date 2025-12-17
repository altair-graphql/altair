import deepmerge from 'deepmerge';
import colors from 'color-name';
import { boolean, number, object, output, string, union } from 'zod/v4';

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

export const themeSchema = object({
  /**
   * CSS transition easing function for smooth animations
   */
  easing: string()
    .meta({
      description: 'CSS transition easing function for smooth animations',
    })
    .optional(),

  /**
   * Whether this theme follows system preferences (light/dark mode)
   */
  isSystem: boolean()
    .meta({
      description: 'Whether this theme follows system preferences (light/dark mode)',
    })
    .optional(),

  /**
   * Black color used for high contrast elements
   */
  'color.black': string()
    .meta({
      description: 'Black color used for high contrast elements',
    })
    .optional(),
  /**
   * Dark gray color for muted text and secondary elements
   */
  'color.darkGray': string()
    .meta({
      description: 'Dark gray color for muted text and secondary elements',
    })
    .optional(),
  /**
   * Medium gray color for neutral backgrounds and borders
   */
  'color.gray': string()
    .meta({
      description: 'Medium gray color for neutral backgrounds and borders',
    })
    .optional(),
  /**
   * Light gray color for subtle backgrounds and dividers
   */
  'color.lightGray': string()
    .meta({
      description: 'Light gray color for subtle backgrounds and dividers',
    })
    .optional(),
  /**
   * White color for light backgrounds and text
   */
  'color.white': string()
    .meta({
      description: 'White color for light backgrounds and text',
    })
    .optional(),
  /**
   * Green color typically used for success states and positive actions
   */
  'color.green': string()
    .meta({
      description:
        'Green color typically used for success states and positive actions',
    })
    .optional(),
  /**
   * Blue color for informational elements and links
   */
  'color.blue': string()
    .meta({
      description: 'Blue color for informational elements and links',
    })
    .optional(),
  /**
   * Rose/pink color for accent elements and highlights
   */
  'color.rose': string()
    .meta({
      description: 'Rose/pink color for accent elements and highlights',
    })
    .optional(),
  /**
   * Bright magenta/cerise color for special emphasis
   */
  'color.cerise': string()
    .meta({
      description: 'Bright magenta/cerise color for special emphasis',
    })
    .optional(),
  /**
   * Red color for error states and destructive actions
   */
  'color.red': string()
    .meta({
      description: 'Red color for error states and destructive actions',
    })
    .optional(),
  /**
   * Orange color for warning states and secondary actions
   */
  'color.orange': string()
    .meta({
      description: 'Orange color for warning states and secondary actions',
    })
    .optional(),
  /**
   * Yellow color for caution states and highlights
   */
  'color.yellow': string()
    .meta({
      description: 'Yellow color for caution states and highlights',
    })
    .optional(),
  /**
   * Light red/salmon color for subtle error indicators
   */
  'color.lightRed': string()
    .meta({
      description: 'Light red/salmon color for subtle error indicators',
    })
    .optional(),
  /**
   * Dark purple color for premium features or special elements
   */
  'color.darkPurple': string()
    .meta({
      description: 'Dark purple color for premium features or special elements',
    })
    .optional(),

  /**
   * Primary brand color used for main interactive elements
   */
  'color.primary': string()
    .meta({
      description: 'Primary brand color used for main interactive elements',
    })
    .optional(),
  /**
   * Secondary brand color used for supporting interactive elements
   */
  'color.secondary': string()
    .meta({
      description: 'Secondary brand color used for supporting interactive elements',
    })
    .optional(),
  /**
   * Tertiary brand color used for accent and decorative elements
   */
  'color.tertiary': string()
    .meta({
      description: 'Tertiary brand color used for accent and decorative elements',
    })
    .optional(),
  /**
   * Main background color for the application
   */
  'color.bg': string()
    .meta({ description: 'Main background color for the application' })
    .optional(),
  /**
   * Alternative background color for cards, panels, and sections
   */
  'color.offBg': string()
    .meta({
      description: 'Alternative background color for cards, panels, and sections',
    })
    .optional(),
  /**
   * Primary text color for readable content
   */
  'color.font': string()
    .meta({ description: 'Primary text color for readable content' })
    .optional(),
  /**
   * Secondary text color for less emphasized content
   */
  'color.offFont': string()
    .meta({
      description: 'Secondary text color for less emphasized content',
    })
    .optional(),
  /**
   * Primary border color for main UI elements
   */
  'color.border': string()
    .meta({
      description: 'Primary border color for main UI elements',
    })
    .optional(),
  /**
   * Secondary border color for subtle divisions
   */
  'color.offBorder': string()
    .meta({
      description: 'Secondary border color for subtle divisions',
    })
    .optional(),

  /**
   * Background color specifically for the header section
   */
  'color.headerBg': string()
    .meta({
      description: 'Background color specifically for the header section',
    })
    .optional(),

  /**
   * Base font size in pixels used for calculations
   */
  'fontSize.base': number()
    .meta({
      description: 'Base font size in pixels used for calculations',
    })
    .optional(),
  /**
   * Root em base size in pixels for responsive typography
   */
  'fontSize.remBase': number()
    .meta({
      description: 'Root em base size in pixels for responsive typography',
    })
    .optional(),
  /**
   * Standard body text font size
   */
  'fontSize.body': number()
    .meta({ description: 'Standard body text font size' })
    .optional(),
  /**
   * Smaller body text font size for secondary content
   */
  'fontSize.bodySmaller': number()
    .meta({
      description: 'Smaller body text font size for secondary content',
    })
    .optional(),
  /**
   * Font size for code editor text
   */
  'fontSize.code': number()
    .meta({
      description: 'Font size for code editor text',
    })
    .optional(),
  /**
   * Default system font stack for UI elements
   */
  'fontFamily.default': string()
    .meta({
      description: 'Default system font stack for UI elements',
    })
    .optional(),

  /**
   * Font family specifically for code editor and monospace content
   */
  'fontFamily.code': string()
    .meta({
      description: 'Font family specifically for code editor and monospace content',
    })
    .optional(),
  /**
   * Color used for drop shadows and elevation effects
   */
  'shadow.color': string()
    .meta({
      description: 'Color used for drop shadows and elevation effects',
    })
    .optional(),
  /**
   * Opacity level for shadow effects (0.0 to 1.0)
   */
  'shadow.opacity': number()
    .meta({
      description: 'Opacity level for shadow effects (0.0 to 1.0)',
    })
    .min(0)
    .max(1)
    .optional(),

  /**
   * Color for code comments and documentation
   */
  'color.editor.comment': string()
    .meta({
      description: 'Color for code comments and documentation',
    })
    .optional(),
  /**
   * Color for string literals in code
   */
  'color.editor.string': string()
    .meta({ description: 'Color for string literals in code' })
    .optional(),
  /**
   * Color for numeric literals in code
   */
  'color.editor.number': string()
    .meta({ description: 'Color for numeric literals in code' })
    .optional(),
  /**
   * Color for variable names and identifiers
   */
  'color.editor.variable': string()
    .meta({
      description: 'Color for variable names and identifiers',
    })
    .optional(),
  /**
   * Color for programming language keywords
   */
  'color.editor.keyword': string()
    .meta({
      description: 'Color for programming language keywords',
    })
    .optional(),
  /**
   * Color for atomic values like boolean literals
   */
  'color.editor.atom': string()
    .meta({
      description: 'Color for atomic values like boolean literals',
    })
    .optional(),
  /**
   * Color for HTML/XML/GraphQL attributes
   */
  'color.editor.attribute': string()
    .meta({
      description: 'Color for HTML/XML/GraphQL attributes',
    })
    .optional(),
  /**
   * Color for properties
   */
  'color.editor.property': string()
    .meta({ description: 'Color for properties' })
    .optional(),
  /**
   * Color for punctuation marks like brackets and commas
   */
  'color.editor.punctuation': string()
    .meta({
      description: 'Color for punctuation marks like brackets and commas',
    })
    .optional(),
  /**
   * Color for function, class, type definitions
   */
  'color.editor.definition': string()
    .meta({
      description: 'Color for function, class, type definitions',
    })
    .optional(),
  /**
   * Color for built-in functions and types
   */
  'color.editor.builtin': string()
    .meta({
      description: 'Color for built-in functions and types',
    })
    .optional(),
  /**
   * Color for the text cursor in the editor
   */
  'color.editor.cursor': string()
    .meta({
      description: 'Color for the text cursor in the editor',
    })
    .optional(),
});

const requiredThemeSchema = themeSchema.required();
export type ITheme = output<typeof requiredThemeSchema>;
const themeDefaults: ITheme = {
  easing: 'ease',
  isSystem: false,
  'color.black': foundationColors.black,
  'color.darkGray': foundationColors.darkGray,
  'color.gray': foundationColors.gray,
  'color.lightGray': foundationColors.lightGray,
  'color.white': foundationColors.white,
  'color.green': foundationColors.green,
  'color.blue': foundationColors.blue,
  'color.rose': foundationColors.rose,
  'color.cerise': foundationColors.cerise,
  'color.red': foundationColors.red,
  'color.orange': foundationColors.orange,
  'color.yellow': foundationColors.yellow,
  'color.lightRed': foundationColors.lightRed,
  'color.darkPurple': foundationColors.darkPurple,
  'color.primary': foundationColors.green,
  'color.secondary': foundationColors.blue,
  'color.tertiary': foundationColors.rose,
  'color.bg': foundationColors.lightGray,
  'color.offBg': foundationColors.white,
  'color.font': foundationColors.black,
  'color.offFont': foundationColors.darkGray,
  'color.border': foundationColors.darkGray,
  'color.offBorder': foundationColors.gray,
  'color.headerBg': foundationColors.white,
  'fontSize.base': 24,
  'fontSize.remBase': 24,
  'fontSize.body': 13,
  'fontSize.bodySmaller': 12,
  'fontSize.code': 12,
  'fontFamily.default':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  'fontFamily.code': 'JetBrains Mono, monospace',
  'shadow.color': foundationColors.black,
  'shadow.opacity': 0.1,
  'color.editor.comment': foundationColors.darkGray,
  'color.editor.string': foundationColors.orange,
  'color.editor.number': foundationColors.orange,
  'color.editor.variable': foundationColors.black,
  'color.editor.keyword': foundationColors.blue,
  'color.editor.atom': foundationColors.black,
  'color.editor.attribute': foundationColors.green,
  'color.editor.property': foundationColors.blue,
  'color.editor.punctuation': foundationColors.blue,
  'color.editor.definition': foundationColors.orange,
  'color.editor.builtin': foundationColors.orange,
  'color.editor.cursor': foundationColors.blue,
};

const colorsSchema = object({
  /**
   * Black color used for high contrast elements
   */
  black: string()
    .meta({
      description: 'Black color used for high contrast elements',
    })
    .optional(),
  /**
   * Dark gray color for muted text and secondary elements
   */
  darkGray: string()
    .meta({
      description: 'Dark gray color for muted text and secondary elements',
    })
    .optional(),
  /**
   * Medium gray color for neutral backgrounds and borders
   */
  gray: string()
    .meta({
      description: 'Medium gray color for neutral backgrounds and borders',
    })
    .optional(),
  /**
   * Light gray color for subtle backgrounds and dividers
   */
  lightGray: string()
    .meta({
      description: 'Light gray color for subtle backgrounds and dividers',
    })
    .optional(),
  /**
   * White color for light backgrounds and text
   */
  white: string()
    .meta({
      description: 'White color for light backgrounds and text',
    })
    .optional(),
  /**
   * Green color typically used for success states and positive actions
   */
  green: string()
    .meta({
      description:
        'Green color typically used for success states and positive actions',
    })
    .optional(),
  /**
   * Blue color for informational elements and links
   */
  blue: string()
    .meta({
      description: 'Blue color for informational elements and links',
    })
    .optional(),
  /**
   * Rose/pink color for accent elements and highlights
   */
  rose: string()
    .meta({
      description: 'Rose/pink color for accent elements and highlights',
    })
    .optional(),
  /**
   * Bright magenta/cerise color for special emphasis
   */
  cerise: string()
    .meta({
      description: 'Bright magenta/cerise color for special emphasis',
    })
    .optional(),
  /**
   * Red color for error states and destructive actions
   */
  red: string()
    .meta({
      description: 'Red color for error states and destructive actions',
    })
    .optional(),
  /**
   * Orange color for warning states and secondary actions
   */
  orange: string()
    .meta({
      description: 'Orange color for warning states and secondary actions',
    })
    .optional(),
  /**
   * Yellow color for caution states and highlights
   */
  yellow: string()
    .meta({
      description: 'Yellow color for caution states and highlights',
    })
    .optional(),
  /**
   * Light red/salmon color for subtle error indicators
   */
  lightRed: string()
    .meta({
      description: 'Light red/salmon color for subtle error indicators',
    })
    .optional(),
  /**
   * Dark purple color for premium features or special elements
   */
  darkPurple: string()
    .meta({
      description: 'Dark purple color for premium features or special elements',
    })
    .optional(),

  /**
   * Primary brand color used for main interactive elements
   */
  primary: string()
    .meta({
      description: 'Primary brand color used for main interactive elements',
    })
    .optional(),
  /**
   * Secondary brand color used for supporting interactive elements
   */
  secondary: string()
    .meta({
      description: 'Secondary brand color used for supporting interactive elements',
    })
    .optional(),
  /**
   * Tertiary brand color used for accent and decorative elements
   */
  tertiary: string()
    .meta({
      description: 'Tertiary brand color used for accent and decorative elements',
    })
    .optional(),
  /**
   * Main background color for the application
   */
  bg: string()
    .meta({ description: 'Main background color for the application' })
    .optional(),
  /**
   * Alternative background color for cards, panels, and sections
   */
  offBg: string()
    .meta({
      description: 'Alternative background color for cards, panels, and sections',
    })
    .optional(),
  /**
   * Primary text color for readable content
   */
  font: string()
    .meta({ description: 'Primary text color for readable content' })
    .optional(),
  /**
   * Secondary text color for less emphasized content
   */
  offFont: string()
    .meta({
      description: 'Secondary text color for less emphasized content',
    })
    .optional(),
  /**
   * Primary border color for main UI elements
   */
  border: string()
    .meta({
      description: 'Primary border color for main UI elements',
    })
    .optional(),
  /**
   * Secondary border color for subtle divisions
   */
  offBorder: string()
    .meta({
      description: 'Secondary border color for subtle divisions',
    })
    .optional(),

  /**
   * Background color specifically for the header section
   */
  headerBg: string()
    .meta({
      description: 'Background color specifically for the header section',
    })
    .optional(),
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
      .optional(),
    /**
     * Root em base size in pixels for responsive typography
     */
    remBase: number()
      .meta({
        description: 'Root em base size in pixels for responsive typography',
      })
      .optional(),
    /**
     * Standard body text font size
     */
    body: number().meta({ description: 'Standard body text font size' }).optional(),
    /**
     * Smaller body text font size for secondary content
     */
    bodySmaller: number()
      .meta({
        description: 'Smaller body text font size for secondary content',
      })
      .optional(),
  }),
  fontFamily: object({
    /**
     * Default system font stack for UI elements
     */
    default: string()
      .meta({
        description: 'Default system font stack for UI elements',
      })
      .optional(),
  }).optional(),
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
      .optional(),
  }).optional(),
  /**
   * Font size for code editor text
   */
  fontSize: number()
    .meta({
      description: 'Font size for code editor text',
    })
    .optional(),
  colors: object({
    /**
     * Color for code comments and documentation
     */
    comment: string()
      .meta({
        description: 'Color for code comments and documentation',
      })
      .optional(),
    /**
     * Color for string literals in code
     */
    string: string()
      .meta({ description: 'Color for string literals in code' })
      .optional(),
    /**
     * Color for numeric literals in code
     */
    number: string()
      .meta({ description: 'Color for numeric literals in code' })
      .optional(),
    /**
     * Color for variable names and identifiers
     */
    variable: string()
      .meta({
        description: 'Color for variable names and identifiers',
      })
      .optional(),
    /**
     * Color for programming language keywords
     */
    keyword: string()
      .meta({
        description: 'Color for programming language keywords',
      })
      .optional(),
    /**
     * Color for atomic values like boolean literals
     */
    atom: string()
      .meta({
        description: 'Color for atomic values like boolean literals',
      })
      .optional(),
    /**
     * Color for HTML/XML/GraphQL attributes
     */
    attribute: string()
      .meta({
        description: 'Color for HTML/XML/GraphQL attributes',
      })
      .optional(),
    /**
     * Color for properties
     */
    property: string().meta({ description: 'Color for properties' }).optional(),
    /**
     * Color for punctuation marks like brackets and commas
     */
    punctuation: string()
      .meta({
        description: 'Color for punctuation marks like brackets and commas',
      })
      .optional(),
    /**
     * Color for function, class, type definitions
     */
    definition: string()
      .meta({
        description: 'Color for function, class, type definitions',
      })
      .optional(),
    /**
     * Color for built-in functions and types
     */
    builtin: string()
      .meta({
        description: 'Color for built-in functions and types',
      })
      .optional(),
    /**
     * Color for the text cursor in the editor
     */
    cursor: string()
      .meta({
        description: 'Color for the text cursor in the editor',
      })
      .optional(),
  }).optional(),
});
export const oldThemeSchema = object({
  /**
   * CSS transition easing function for smooth animations
   */
  easing: string()
    .meta({
      description: 'CSS transition easing function for smooth animations',
    })
    .optional(),
  colors: colorsSchema.optional(),
  type: typeSchema.optional(),
  /**
   * Whether this theme follows system preferences (light/dark mode)
   */
  isSystem: boolean()
    .meta({
      description: 'Whether this theme follows system preferences (light/dark mode)',
    })
    .optional(),
  shadow: object({
    /**
     * Color used for drop shadows and elevation effects
     */
    color: string()
      .meta({
        description: 'Color used for drop shadows and elevation effects',
      })
      .optional(),
    /**
     * Opacity level for shadow effects (0.0 to 1.0)
     */
    opacity: number()
      .meta({
        description: 'Opacity level for shadow effects (0.0 to 1.0)',
      })
      .min(0)
      .max(1)
      .optional(),
  }).optional(),
  editor: editorThemeSchema.optional(),
}).meta({ deprecated: true });

export function transformOldThemeConfigToNewThemeConfig(
  oldTheme: output<typeof oldThemeSchema>
) {
  // Transform nested theme structure into flat theme structure
  const res: output<typeof themeSchema> = {
    easing: oldTheme.easing,
    isSystem: oldTheme.isSystem,
    'color.bg': oldTheme.colors?.bg,
    'color.offBg': oldTheme.colors?.offBg,
    'color.font': oldTheme.colors?.font,
    'color.offFont': oldTheme.colors?.offFont,
    'color.border': oldTheme.colors?.border,
    'color.offBorder': oldTheme.colors?.offBorder,
    'color.headerBg': oldTheme.colors?.headerBg,
    'color.black': oldTheme.colors?.black,
    'color.darkGray': oldTheme.colors?.darkGray,
    'color.gray': oldTheme.colors?.gray,
    'color.lightGray': oldTheme.colors?.lightGray,
    'color.white': oldTheme.colors?.white,
    'color.green': oldTheme.colors?.green,
    'color.blue': oldTheme.colors?.blue,
    'color.rose': oldTheme.colors?.rose,
    'color.cerise': oldTheme.colors?.cerise,
    'color.red': oldTheme.colors?.red,
    'color.orange': oldTheme.colors?.orange,
    'color.yellow': oldTheme.colors?.yellow,
    'color.lightRed': oldTheme.colors?.lightRed,
    'color.darkPurple': oldTheme.colors?.darkPurple,
    'color.primary': oldTheme.colors?.primary,
    'color.secondary': oldTheme.colors?.secondary,
    'color.tertiary': oldTheme.colors?.tertiary,
    'fontSize.base': oldTheme.type?.fontSize.base,
    'fontSize.remBase': oldTheme.type?.fontSize.remBase,
    'fontSize.body': oldTheme.type?.fontSize.body,
    'fontSize.bodySmaller': oldTheme.type?.fontSize.bodySmaller,
    'fontSize.code': oldTheme.editor?.fontSize,
    'fontFamily.default': oldTheme.type?.fontFamily?.default,
    'fontFamily.code': oldTheme.editor?.fontFamily?.default,
    'shadow.color': oldTheme.shadow?.color,
    'shadow.opacity': oldTheme.shadow?.opacity,
    'color.editor.comment': oldTheme.editor?.colors?.comment,
    'color.editor.string': oldTheme.editor?.colors?.string,
    'color.editor.number': oldTheme.editor?.colors?.number,
    'color.editor.variable': oldTheme.editor?.colors?.variable,
    'color.editor.keyword': oldTheme.editor?.colors?.keyword,
    'color.editor.atom': oldTheme.editor?.colors?.atom,
    'color.editor.attribute': oldTheme.editor?.colors?.attribute,
    'color.editor.property': oldTheme.editor?.colors?.property,
    'color.editor.punctuation': oldTheme.editor?.colors?.punctuation,
    'color.editor.definition': oldTheme.editor?.colors?.definition,
    'color.editor.builtin': oldTheme.editor?.colors?.builtin,
    'color.editor.cursor': oldTheme.editor?.colors?.cursor,
  };

  const final: output<typeof themeSchema> = {};

  // Remove undefined values
  Object.entries(res).forEach(([key, value]) => {
    if (value) {
      (final as Record<string, unknown>)[key] = value;
    }
  });

  return final;
}
export const themeConfigSchema = union([themeSchema, oldThemeSchema]);
export type ICustomTheme = output<typeof themeSchema>;

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
  return deepmerge.all([themeDefaults, customTheme, ...extraThemes]) as ITheme;
};
