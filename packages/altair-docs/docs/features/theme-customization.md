---
parent: Features
---

# Theme Customization

Altair comes with a `light`, `dark` and `dracula` theme. It also allows you specify `system` which would automatically pick either `light` or `dark` theme based on your system color scheme preference. Customize this by specifying `theme` in your [settings](/docs/features/settings-pane). You can also optionally specify `theme.dark` if you want a different theme that will be used if your system color scheme is set to dark mode.

You can also customize the theme and tweak the color scheme of Altair based on your preferences or to match with the look and feel of your product. To customize this, specify `themeConfig` in your [settings](/docs/features/settings-pane). The interface for the theme config can be found [here](/api/core/theme/theme/interfaces/ITheme).

## Understanding Theme Properties

The theme system in Altair is built around a comprehensive set of properties that control every aspect of the visual appearance. Below is a detailed guide to help you understand what each property controls.

### Color Properties

#### Background Colors
- **`colors.bg`**: Main application background color. This is the primary surface color visible throughout the app.
- **`colors.offBg`**: Secondary background color used for panels, sidebars, headers, and elevated surfaces. Creates visual depth by contrasting with `bg`.
- **`colors.headerBg`**: Specific color for the top header bar. Defaults to `offBg` if not specified.

#### Text Colors
- **`colors.font`**: Primary text color for main content, headings, and labels. Should have high contrast with `bg`.
- **`colors.offFont`**: Secondary text color for helper text, timestamps, and less emphasized content. Should be readable but more subtle than `font`.

#### Border Colors
- **`colors.border`**: Primary border color for input fields, cards, and main UI separators.
- **`colors.offBorder`**: Subtle border color for background separators and inactive borders.

#### Brand Colors
- **`colors.primary`**: Main brand color used for primary buttons, active tabs, focus indicators, and checkboxes. This is your main interactive color.
- **`colors.secondary`**: Supporting brand color used for secondary buttons, links, and informational elements.
- **`colors.tertiary`**: Accent color used for badges, highlights, and decorative elements.

#### Foundation Colors
These are the base palette colors that can be used throughout your theme:
- **`colors.black`**, **`colors.darkGray`**, **`colors.gray`**, **`colors.lightGray`**, **`colors.white`**: Neutral colors
- **`colors.green`**: Success states and positive actions
- **`colors.blue`**: Informational elements
- **`colors.red`**: Error states and destructive actions
- **`colors.orange`**: Warning states
- **`colors.yellow`**: Caution highlights
- **`colors.rose`**, **`colors.cerise`**: Accent colors

### Editor Colors

The code editor (query editor, variables editor, headers, response viewer) has its own color scheme:

- **`editor.colors.comment`**: GraphQL comment lines (lines starting with `#`)
- **`editor.colors.string`**: String values in quotes, argument values
- **`editor.colors.number`**: Numeric values like `123`, `45.67`
- **`editor.colors.variable`**: Variable names (`$variableName`), field names, type names
- **`editor.colors.keyword`**: GraphQL keywords like `query`, `mutation`, `subscription`, `fragment`
- **`editor.colors.atom`**: Boolean values (`true`, `false`, `null`)
- **`editor.colors.attribute`**: Directives like `@include`, `@skip`
- **`editor.colors.property`**: Field names in queries and responses
- **`editor.colors.punctuation`**: Brackets, commas, colons `{ } [ ] ( ) , :`
- **`editor.colors.definition`**: Type definitions and operation names
- **`editor.colors.builtin`**: Built-in scalar types (`String`, `Int`, `Boolean`)
- **`editor.colors.cursor`**: The blinking text cursor

### Typography

- **`editor.fontFamily.default`**: Font for all code editors (query, variables, headers, response)
- **`editor.fontSize`**: Size of text in code editors
- **`type.fontSize.remBase`**: Base font size for the entire application

## Example Theme Configuration

Here's an example theme config of a faded blue-green theme in Altair, with transparent comments (but why?!) in the editor:

```json
{
  // ...
  "themeConfig": {
    "colors": {
      "primary": "#629460",
      "secondary": "#385F71",
      "font": "#F5F0F6",
      "bg": "#2B4162",
      "offBg": "#3A5070",
      "headerBg": "#2B4162"
    },
    "editor": {
      "colors": {
        "comment": "transparent"
      }
    }
  }
}
```

![Pale blue-green Altair theme](/assets/img/docs/pale-blue-green-theme.png)

That was nice and easy! And it gets better.. you can publish your theme as [a plugin](/docs/plugins/writing-plugin) so others can also enjoy it!

## Tips for Creating Accessible Themes

When creating custom themes, especially if you have visual accessibility needs:

1. **Ensure High Contrast**: Make sure `colors.font` has high contrast with `colors.bg` for readability.
2. **Test Both Modes**: If using `system` theme, test your `themeConfig` with both light and dark system preferences.
3. **Distinguish Interactive Elements**: Use distinct `primary`, `secondary`, and `tertiary` colors to make interactive elements easily identifiable.
4. **Editor Readability**: Choose editor colors that have good contrast with your background. Comments should be visible but distinguishable from code.
5. **Border Visibility**: Ensure borders are visible enough to define sections without being distracting.

## Common Theme Patterns

### High Contrast Dark Theme
```json
{
  "themeConfig": {
    "colors": {
      "bg": "#000000",
      "offBg": "#1a1a1a",
      "font": "#ffffff",
      "offFont": "#cccccc",
      "border": "#555555",
      "primary": "#00ff00"
    }
  }
}
```

### Warm Light Theme
```json
{
  "themeConfig": {
    "colors": {
      "bg": "#faf8f5",
      "offBg": "#ffffff",
      "font": "#2d2d2d",
      "offFont": "#666666",
      "border": "#d4d4d4",
      "primary": "#d97706"
    }
  }
}
```

## Visual Mapping Guide

This section maps theme properties to actual UI elements you see in Altair, helping you understand exactly what changes when you modify each property.

### Main Application Areas

| UI Element | Theme Property | CSS Variable | Description |
|------------|----------------|--------------|-------------|
| Main editor area background | `colors.bg` | `--theme-bg-color` | The background behind your query editor |
| Sidebar background | `colors.offBg` | `--theme-off-bg-color` | Left sidebar with history and collections |
| Header bar | `colors.headerBg` | `--header-bg-color` | Top navigation bar |
| Modal/Dialog background | `colors.bg` | `--theme-bg-color` | Settings, documentation dialogs |
| Panel backgrounds | `colors.offBg` | `--theme-off-bg-color` | Response viewer, docs panel |

### Text Elements

| UI Element | Theme Property | CSS Variable | Description |
|------------|----------------|--------------|-------------|
| Main body text | `colors.font` | `--theme-font-color` | Labels, headings, primary text |
| Secondary text | `colors.offFont` | `--theme-off-font-color` | Helper text, descriptions, timestamps |
| Button text | `colors.font` | `--theme-font-color` | Text on buttons (when not using primary color) |
| Tab labels | `colors.font` | `--theme-font-color` | Window tab labels |

### Interactive Elements

| UI Element | Theme Property | CSS Variable | Description |
|------------|----------------|--------------|-------------|
| Primary action buttons | `colors.primary` | `--primary-color` | Send button, Save button, main CTAs |
| Active tab indicator | `colors.primary` | `--primary-color` | Currently selected tab highlight |
| Checkboxes (checked) | `colors.primary` | `--primary-color` | Selected checkboxes |
| Links | `colors.secondary` | `--secondary-color` | Hyperlinks in documentation |
| Focus indicators | `colors.primary` | `--primary-color` | Keyboard focus outline |
| Badges/Pills | `colors.tertiary` | `--tertiary-color` | Status badges, tags |

### Borders and Dividers

| UI Element | Theme Property | CSS Variable | Description |
|------------|----------------|--------------|-------------|
| Input borders | `colors.border` | `--theme-border-color` | Text inputs, textarea borders |
| Card borders | `colors.border` | `--theme-border-color` | Panel and card outlines |
| Subtle dividers | `colors.offBorder` | `--theme-off-border-color` | Section separators |
| Inactive borders | `colors.offBorder` | `--theme-off-border-color` | Disabled or inactive elements |

### Code Editor Syntax

| UI Element | Theme Property | CSS Variable | Example in GraphQL |
|------------|----------------|--------------|-------------------|
| Comments | `editor.colors.comment` | `--editor-comment-color` | `# This is a comment` |
| Strings | `editor.colors.string` | `--editor-string-color` | `"Hello World"` |
| Numbers | `editor.colors.number` | `--editor-number-color` | `123`, `45.67` |
| Keywords | `editor.colors.keyword` | `--editor-keyword-color` | `query`, `mutation`, `fragment` |
| Variables | `editor.colors.variable` | `--editor-variable-color` | `$userId`, field names |
| Directives | `editor.colors.attribute` | `--editor-attribute-color` | `@include`, `@skip` |
| Properties | `editor.colors.property` | `--editor-property-color` | Field names in responses |
| Punctuation | `editor.colors.punctuation` | `--editor-punctuation-color` | `{ } [ ] ( ) , :` |
| Booleans | `editor.colors.atom` | `--editor-atom-color` | `true`, `false`, `null` |

### Plugin Panels

Plugins like Apollo Tracing inherit theme colors:
- **Plugin background**: Uses `colors.bg` with transparency
- **Plugin text**: Uses `colors.font` for readability
- **Plugin accents**: Uses `colors.primary` for highlights
- **Plugin secondary text**: Uses `colors.offFont` for less important info

::: tip Note
You can also customize the accent color of Altair by specifying `accentColor` in your [environment variables](/docs/features/environment-variables#special-environment-variables). This is useful if you wish to switch the accent color based on the environment you are working with.
:::
