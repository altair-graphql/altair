---
parent: Plugins
---

## Writing A Plugin

A plugin allows extending the functionality of Altair to be able to do more. There are a few types of plugins that can be created for Altair including sidebar, header, action buttons. For all plugin types, you would need to take note of the following:

- Every plugin should be published as public npm packages
- All plugin names should begin with `altair-graphql-plugin-`. For example, `altair-graphql-plugin-graphql-explorer` is the name of the GraphQL explorer plugin
- All plugins must have a `manifest.json` file, which is what Altair would read, and what would define your plugin structure
- The plugin manifest.json file should conform to the [PluginManifest interface](https://github.com/imolorhe/altair/blob/master/packages/altair-app/src/app/services/plugin/plugin.ts#L52)

An example plugin manifest can be found [here](https://github.com/imolorhe/altair-graphql-plugin-birdseye/blob/master/manifest.json).

#### manifest.json file

The manifest.json file has the following fields:

- `manifest_version` _(Required)_: This should be set to `1`. It is just a control measure for variations in the manifest config. Since this is still in beta, changes to the manifest structure wouldn't lead to change in the `manifest_version`.
- `name` _(Required)_: This is the name of the plugin. It should be the same name you would use in your `package.json` file. It uniquely identifies your plugin. The plugin name must begin with `altair-graphql-plugin-`.
- `display_name` _(Required)_: This is the name of the plugin that is displayed in the UI. It is the human readable version of your plugin name.
- `version` _(Required)_: This is the version of your plugin. It should be the same version you would have in your `package.json` file (except you have a good reason why they should be different).
- `description` _(Required)_: This is the description of what your plugin is about. It would be used to describe your plugin.
- `type` _(Required)_: This specifies the type of plugin. Available options are 'header', 'sidebar', 'action_button'. This determines how the plugin would interact with Altair.
- `scripts` _(Required)_: An array containing the list of scripts (relative to the plugin root directory) that need to be loaded for the plugin to function.
- `author`: The name of the plugin author.
- `author_email`: The email of the author.
- `styles`: An array containing the list of styles (relative to the plugin root directory) that need to be loaded for the plugin to function.
- `capabilities`: Specifies the capabilities (functionalities) available to the plugin. In the future, this would be used to request the necessary permissions from the user.
- `sidebar_opts`: Specifies options required for sidebar (and header) plugins.
    - `element_name`: Specifies the name of the web component that should be rendered for the sidebar component
    - `icon`: Specifies the relative path to the svg icon for the plugin (This is not functional yet)
- `action_button_opts`: Specifies options required for action button plugins.
    - `class_name`: Specifies the name of the plugin class to instantiate for the action button plugin
    - `location`: Specifies the location of the action button. Available options are 'result_pane'.

#### Developing Plugins Locally

To write a plugin for Altair in local development, you would need to clone the [Altair repository](https://github.com/imolorhe/altair), navigate to the `packages/altair-app` directory, run `yarn` to install dependencies, then `yarn start` to launch the local development server for Altair. You can access the instance of Altair at `http://localhost:4200/`.

Now go to `packages/altair-app/src/app/containers/app/app.component.ts` file and you should see a comment similar to the one below:

```ts
// this.pluginRegistry.fetchPlugin('altair-graphql-plugin-birdseye', {
//   pluginSource: 'url',
//   version: '0.0.4',
//   url: 'http://localhost:8002/'
// });
```

You can uncomment those lines and replace the values according to your local plugin setup. For example, if working on a plugin called `altair-graphql-plugin-some-plugin`, hosted on `http://localhost:8080/`, you would have the following:

```ts
this.pluginRegistry.fetchPlugin('altair-graphql-plugin-some-plugin', {
  pluginSource: 'url',
  version: '0.0.1',
  url: 'http://localhost:8080/'
});
```

After these, ensure you have `enableExperimental` option set to `true` in the settings pane, and restart the Altair app.


### Sidebar Plugins

![graphiql explorer](https://i.imgur.com/DANxbjh.png)

Sidebar plugins are added to each window, and can be made to contain any UI (but it is recommended to have the UI follow the design of Altair). For example, the GraphQL explorer plugin shows the explorer for each query in each of your windows.

Sidebar plugins make use of [web components](https://www.webcomponents.org/) to render the plugins in Altair, making it easy for you to create your plugins in any JS framework of your choice. As long as you can export the component as a web component, you can use it in Altair.

#### Options in manifest.json

For a sidebar plugin, you would need the following in the manifest.json file:

- `type` _(Required)_: This should be set to `sidebar`.
- `sidebar_opts` _(Required)_:
    - `element_name` _(Required)_: Specify the name of the web component that should be rendered. This is the name you specify when you call `window.customElements.define(elementName, CustomElement);`

All the functionality of your plugin would be within the component you define. The plugin component should expect a prop called `props` (yes I know. This can be confusing, but this is because I'm trying to support components built with react. For some reason this is how they do it). The `props` passed to the component would contain the methods for interacting with Altair. The `props` property would implement the [`PluginComponentDataProps` interface](https://github.com/imolorhe/altair/blob/master/packages/altair-app/src/app/services/plugin/plugin.ts#L90).
<!-- TODO: List out the options in props -->

For customizing your plugin component styles, you should use [Altair CSS variables](https://github.com/imolorhe/altair/blob/master/packages/altair-app/src/scss/_variables.scss#L1), as opposed to static styling as much as possible. The benefit of this is that, your plugin styling follows the various themes that Altair has without looking awkward or out of place. 


### Header Plugins

Header plugins are added as modals in the app, with the button located at the top of the app.

Header plugins are very similar to sidebar plugins. The only difference between header plugins and sidebar plugins is that the type is set to `header`.

### Action Button Plugins

Action button plugins allow adding buttons to perform additional functionality within Altair.


For an action button plugin, you would need the following in the manifest.json file:

- `type` _(Required)_: This should be set to `action_button`.
- `action_button_opts` _(Required)_:
    - `class_name` _(Required)_: Specify the name of the JavaScript class for the plugin
    - `location` _(Required)_: Specify the location for the button. Available options are `result_pane`

As opposed to the sidebar plugins, action button plugins are simple classes that implement the following interface:

```js
class ActionButtonPluginName {
    constructor(props) {}

    // Called to retrieve the render information for the button.
    // Currently only the text of the button is required.
    async render(props) {
        return {
            text: 'Button text'
        };
    }

    // Called when the action button is clicked
    async execute(props) {
        alert('This is the action executed when the button clicked');
    }

    // Perform cleanups in this function
    async destroy(props) {}
}

// Add the class to the Altair plugins object
window.AltairGraphQL.plugins.ActionButtonPluginName = ActionButtonPluginName;

```

For a simple action button, you only need a single script containing your plugin class (as described above), your manifest.json file, and your package.json file (since it's going to be an npm package).
