---
parent: Features
---

# Settings Pane

A settings modal is available in the app to allow you customize all the various aspects of the application including the theme, language, and styling options. The settings are specified in form of a JSON object. e.g.

```json
{
  "theme": "light",
  "language": "en-US",
  "addQueryDepthLimit": 6,
  "tabSize": 5
}
```

The available options are listed here:

### `theme` - Specifies the theme
Options include `light`, `dark`, `dracula`, `system`.

### `language` - Specifies the language
The options are any of the valid language codes according to: [https://support.crowdin.com/api/language-codes/](https://support.crowdin.com/api/language-codes/).

However not all the languages are translated. The available translations are [English, French, Español, Czech, German, Brazilian, Russian, Chinese Simplified, Japanese, Serbian, Italian, Polish, Korea](https://crowdin.com/project/altair-gql).

### `addQueryDepthLimit` - Specifies how deep the 'Add query' functionality would go
You can specify any valid number here.

### `tabSize` - Specifies the tab size in the editor
You can specify any valid number here.


### `theme.fontsize` - Specifies the base font size
_Default: 24_

### `theme.editorFontFamily` - Specifies the font family for the editors
Any valid CSS font family combinations can be used here.

### `disablePushNotification` - Specifies if native push notifications should be disabled
_Default: false_

### `enableExperimental` - Enable experimental features in Altair. Note: The features might be unstable
_Default: false_

### `alert.disableWarnings` - Disable warning alerts
_Default: false_

### `plugin.list` - Specifies a list of enabled plugins (requires enableExperimental to be true)
_Default: []_
Plugins are specified in a string format `<plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>]`:

- `<plugin-source>` _(Optional)_ specifies the source of the plugin. Options include `npm`, `url`, `github`.
- `<plugin-name>` **_Required_** specifies the name of the plugin. Plugin names must begin with `altair-graphql-plugin-`.
- `<version>` _(Optional)_ specifies the version of the plugin.
- `[<opt>]->[<opt-value>]` _(Optional)_ specifies an extran option for the plugin. This is used when you specify the source as `url`. In that case, you need to specify the URL where the plugin would be sourced from.

Valid plugins in string format include: `altair-graphql-plugin-some-plugin`, `npm:altair-graphql-plugin-some-plugin`, `npm:altair-graphql-plugin-some-plugin@0.3.4`, `url:altair-graphql-plugin-some-plugin@0.3.4::[url]->[http://example.com/some-plugin]`

### `editor.shortcuts` - Contains shortcut to action mapping
_Default: {}_
You can add new editor shortcut mapping following the [CodeMirror key map pattern](https://codemirror.net/doc/manual.html#keymaps). For example, to add a new shortcut to toggle comments, you can add `{ "Ctrl-7": "toggleComment" }`. There are several editor actions you can add shortcuts for including: `showAutocomplete`, `toggleComment`, `showFinder`, `showInDocs`, `fillAllFields`, etc. If you want to disable an in-built shortcut, you can use the `noOp` action. For example to disable `Ctrl-/` from toggling comments, you can use `{ "Ctrl-/": "noOp" }`.
