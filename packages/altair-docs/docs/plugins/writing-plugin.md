---
parent: Plugins
order: 7
---

# Writing a plugin

A plugin allows extending the functionality of Altair to be able to do more. A typical plugin that can be created for Altair involves the following:

- Every plugin should be published as public npm packages
- All plugin names must begin with `altair-graphql-plugin-`. For example, `altair-graphql-plugin-graphql-explorer` is the name of the [GraphQL explorer plugin](https://www.npmjs.com/package/altair-graphql-plugin-graphql-explorer)
- All plugins must have a `manifest.json` file, which is what Altair would read, and what would define your plugin structure
- The plugin manifest.json file should conform with either [PluginManifest](/api/core/plugin/plugin.interfaces/type-aliases/PluginManifest) for v1 and v2 plugins or [PluginV3Manifest](/api/core/plugin/v3/manifest/type-aliases/PluginV3Manifest) for v3 plugins

## V3 Plugins

V3 plugins are the latest plugin format for Altair. The main benefit of v3 plugins is that they are more secure as they run the third party code in sandboxed iframes. This means that the plugins don't have direct access to the main Altair application, and the main Altair application doesn't have direct access to the plugin code, since they run in different contexts. The plugins panels are also run in their own iframe sandboxes separate from the main logic. This is very important since plugins are written by third parties and can be malicious and can cause security issues.

![v3 plugin architecture](/assets/img/docs/plugin-v3-architecture.png)

The manifest.json file for a v3 plugin is defined by the [PluginV3Manifest](/api/core/plugin/v3/manifest/type-aliases/PluginV3Manifest) interface.

::: tip
To get started quickly with writing a plugin, you can use the [Altair AI plugin](https://github.com/altair-graphql/altair/tree/master/plugins/ai) as a template to scaffold your plugin.
:::

V3 plugins are comprised of a simple HTML page (for the iframe sandboxing) that embeds the javascript containing the business logic. The plugin logic should be a JavaScript class that extends the [PluginV3](/api/core/plugin/v3/plugin/classes/PluginV3) abstract class, implementing the `initialize()` and `destroy()` methods. An instance of the class should be created.

```ts
class AltairPluginName extends PluginV3 {
  constructor() {
    super({
      panels: {
        // Add panels here
        'panel-1': new AltairPluginPanel(),
      },
    });
  }
  async initialize(ctx: PluginV3Context) {}

  async destroy() {}
}
new AltairPluginName();
```

The `initialize(ctx)` method receives a [PluginV3Context](/api/core/plugin/v3/context/interfaces/PluginV3Context) parameter, which provides a way for the plugin to interact with Altair.

For plugins that need to create panels, the panels should be defined in the constructor of the plugin class and passed to the super constructor as shown above.

### V3 Plugin Panels

A panel is a way to render a plugin's content within Altair.

![graphiql explorer](https://i.imgur.com/DANxbjh.png)

A panel is a simple JavaScript class that extends the [AltairV3Panel](/api/core/plugin/v3/panel/classes/AltairV3Panel) abstract class, implementing the `create()` method that renders the panel content in the provided DOM container.

```ts
class AltairPluginPanel extends AltairV3Panel {
  create(ctx: PluginV3Context, container: HTMLElement) {}
}
```

To use the panel, add it to the plugin class as shown above. Panels must be referenced by the unique name in the [panels](/api/core/plugin/v3/plugin/interfaces/PluginV3Options#panels) options passed to the super constructor of the plugin class. In the example above, the panel is referenced by the name `panel-1`.

#### Developing V3 Plugins Locally

Ensure you have at least version 7.1.0 of Altair installed. In the `plugin.list` in the settings pane, specify your local plugin following this pattern `url:altair-graphql-plugin-some-plugin@0.0.1::[url]->[http://localhost:8080]`. In this example, you are working on a plugin called `altair-graphql-plugin-some-plugin`, hosted on `http://localhost:8080/` (version is optional).

## V2 Plugins (deprecated)

V2 plugins are the older plugin format for Altair. They are not recommended for new plugins, but they are still supported in newer versions of Altair. The main difference between v2 and v3 plugins is that v2 plugins run in the same context as the main Altair application, while v3 plugins run in a sandboxed iframe. This means the v2 plugins have direct access to the main Altair application and its resources (e.g. cookies, local storage, etc), which can be a security risk.

![v2 plugin architecture](/assets/img/docs/plugin-v2-architecture.png)

The manifest.json file for a v2 plugin is defined by the [PluginManifest](/api/core/plugin/plugin.interfaces/type-aliases/PluginManifest) interface.

The typical v2 plugin is a JavaScript class that implements an `initialize(ctx)` and an optional `destroy()` [method](/api/core/plugin/base/classes/PluginBase#methods) and is added to the `window.AltairGraphQL.plugins` object.

```ts
class AltairPluginName {
  initialize(ctx: PluginContext) {}

  async destroy() {}
}

// Add the class to the Altair plugins object
window.AltairGraphQL.plugins.AltairPluginName = AltairPluginName;
```

You need the [`plugin_class`](/api/core/plugin/plugin.interfaces/type-aliases/PluginManifest#plugin-class) in the manifest.json file. In this case, it would be `AltairPluginName`.

The `initialize(ctx)` method receives a [PluginContext](/api/core/plugin/context/context.interface/interfaces/PluginContext) parameter, which provides a way for the plugin to interact with Altair.

### Supporting both v2 and v3 plugin formats

While v2 plugins are supported (but deprecated) in newer Altair versions, older versions of Altair only support v2 plugins. It is recommended to implement your plugin in the v3 format but you can also support the v2 format in the same plugin.

To support both v2 and v3 formats, you can add the relevant fields to the manifest.json file. The `plugin_class` field is required for v2 plugins, while the `entry` field is required for v3 plugins.

```json
{
  "plugin_class": "AltairPluginName",
  "entry": "plugin.js",

  "manifest_version": 3,
  "name": "altair-graphql-plugin-plugin-name",
  "display_name": "Plugin Name",
  "version": "1.0.0",
  "description": "A plugin for Altair GraphQL Client",
  "entry": {
    "type": "js",
    "scripts": ["dist/plugin.js"],
    "styles": ["dist/plugin.css"]
  },

  "//": "Adding the following for backward compatibility with older versions of Altair.",
  "plugin_class": "AltairPluginName",
  "scripts": ["v1-plugin.js"],
  "styles": ["v1-plugin.css"]
}
```

The GraphQL explorer plugin is an example of a plugin that supports both v2 and v3 formats. You can find the source code [here](https://github.com/XKojiMedia/altair-graphql-plugin-graphql-explorer/blob/9798b554c5e9a1eb96fbbc42a196673d9ea050ac/manifest.json).
