---
parent: Plugins
---

# Writing A Plugin

A plugin allows extending the functionality of Altair to be able to do more. A typical plugin that can be created for Altair involves the following:

- Every plugin should be published as public npm packages
- All plugin names should begin with `altair-graphql-plugin-`. For example, `altair-graphql-plugin-graphql-explorer` is the name of the GraphQL explorer plugin
- All plugins must have a `manifest.json` file, which is what Altair would read, and what would define your plugin structure
- The plugin manifest.json file should conform to the [PluginManifest interface](https://github.com/imolorhe/altair/blob/master/packages/altair-app/src/app/services/plugin/plugin.ts#L52)

An example plugin manifest can be found [here](https://github.com/imolorhe/altair-graphql-plugin-birdseye/blob/master/manifest.json).

#### manifest.json file

The manifest.json file has the following fields:

- `manifest_version` _(Required)_: This should be set to `2`. It is just a control measure for variations in the manifest config.
- `name` _(Required)_: This is the name of the plugin. It should be the same name you would use in your `package.json` file. It uniquely identifies your plugin. The plugin name must begin with `altair-graphql-plugin-`.
- `display_name` _(Required)_: This is the name of the plugin that is displayed in the UI. It is the human readable version of your plugin name.
- `version` _(Required)_: This is the version of your plugin. It should be the same version you would have in your `package.json` file (except you have a good reason why they should be different).
- `description` _(Required)_: This is the description of what your plugin is about. It would be used to describe your plugin.
- `scripts` _(Required)_: An array containing the list of scripts (relative to the plugin root directory) that need to be loaded for the plugin to function.
- `plugin_class` _(Required)_: This specifies the class name of the plugin, for discovery (more details about the plugin class below).
- `author`: The name of the plugin author.
- `author_email`: The email of the author.
- `styles`: An array containing the list of styles (relative to the plugin root directory) that need to be loaded for the plugin to function.
- `capabilities`: Specifies the capabilities (functionalities) available to the plugin. In the future, this would be used to request the necessary permissions from the user.
- `type`: This specifies the type of plugin. This determines how the plugin would interact with Altair. For now there is just the typical plugin type (registered plugin class). In the future, this would include other plugins like themes.

#### Developing Plugins Locally

<!-- TODO: Update minimum version -->
Ensure you have at least version 2.4.7 of Altair installed, and you have `enableExperimental` option set to `true` in the settings pane. In the `plugin.list` in the settings pane, specify your local plugin following this pattern `url:altair-graphql-plugin-some-plugin@0.0.1::[url]->[http://localhost:8080]`. In this example, you are working on a plugin called `altair-graphql-plugin-some-plugin`, hosted on `http://localhost:8080/` (version is optional).


### The typical plugin

The typical plugin is a simple JavaScript class that implements an `initialize(ctx)` and an optional `destroy()` method:

```js
class AltairPluginName {

    initialize(ctx) {}

    async destroy() {}
}

// Add the class to the Altair plugins object
window.AltairGraphQL.plugins.AltairPluginName = AltairPluginName;

```

You need the `plugin_class` in the manifest.json file. In this case, it would be `AltairPluginName`.

The `initialize(ctx)` method receives a plugin context parameter, which provides a way for the plugin to interact with Altair.

The plugin context contains things like:

- `ctx.app.createPanel(element)` - for rendering the provided DOM element in a new panel within Altair. An example of a panel is shown in the GraphiQL explorer plugin.

![graphiql explorer](https://i.imgur.com/DANxbjh.png)

- `ctx.app.createAction({ title, execute(state) {} })` - for rendering an action button with the specified title and the callback to execute when the button is clicked.

- `ctx.app.getWindowState(windowId)` - resolves with the state of the specified window.

- `context.app.addSubscriptionProvider(providerData)` - adds a provider for subscriptions. `providerData` is an object with the following properties:
    - `id` _string_ - Unique identifier for the provider
    - `getProviderClass()` _Promise_ - Function that returns a promise that resolves with the provider class (NOT an instance of the class)
    - `copyTag` _string_ - The text to be shown for this provider in the Altair UI

- `ctx.events.on(evt, callback)` - listens for events within Altair to perform an action within the plugin.

- `ctx.theme.add(themeName, theme)` - adds the provided theme to Altair's theme registry which can later be used.

- `ctx.theme.enable(themeName, isDarkMode=false)` - enables the specified theme.

...and several more functionalities.
<!-- TODO: Add the full plugin context schema -->

For a simple plugin, you only need a single script containing your plugin class (as described above), your manifest.json file, and your package.json file (since it's going to be an npm package).

_This doc is incomplete (help appreciated in completing it)._
