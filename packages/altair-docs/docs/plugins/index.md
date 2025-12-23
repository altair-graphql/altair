---
title: Introduction
has_children: true
permalink: /docs/plugins
order: 1
---

# Plugins

Altair comes with the ability to be extended via plugins. These allow you customize the functionality provided by Altair to be able to do even more than what is directly available in Altair.

## Getting Started with Plugins

### Installing Plugins

Plugins can be added by adding them to the `plugin.list` options in the settings. Alternatively, you can discover available plugins to use from the plugin manager and add the plugin from there (which does the same thing).

![plugin manager icon](https://i.imgur.com/H0eqhvy.png)

![plugin manager](https://i.imgur.com/8zTpbTq.png)

### Plugin Format

Adding plugins to the settings uses the following format:

`<plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>]`

**Plugin source:** Altair supports several sources for plugins: `[npm](https://www.npmjs.com/)` (default), `[github](https://github.com/)` and `url`. Released plugins should be available in npm so all plugins are sourced from npm by default. If you specify the source as `url`, then you need to specify an `opt` for the url such as `[url]->[http://localhost:8080]`. If you specify the source as `github`, then you need to specify an `opt` for the repo to be used such as `[repo]->[imolorhe/altair]`

**Plugin name:** Every plugin must have a name, used to uniquely identify the plugin. Every plugin name must begin with `altair-graphql-plugin-` else Altair would throw an error.

**Version:** You can choose to specify the version of the plugin you want to use. If no version is specified, Altair defaults to use the latest version of the plugin available.

**Extra options:** Depending on the plugin source specified, you can specify extra options as required. All options follow the format `[opt]->[value]`. For example, `[repo]->[imolorhe/altair]`.

### Plugin Examples

In its simplest form, you can retrieve a plugin by specifying only the plugin name, then the default version (latest) and source (npm) are used. The following are valid examples of ways to use plugins:

```yaml
# loads "altair-graphql-plugin-graphql-explorer" plugin from npm using the latest version
altair-graphql-plugin-graphql-explorer

# loads "altair-graphql-plugin-some-plugin" plugin from the localhost URL. Version is ignored
url:altair-graphql-plugin-some-plugin@0.0.1::[url]->[http://localhost:8002]

# loads "altair-graphql-plugin-json-to-csv" plugin from github from the specified repo
github:altair-graphql-plugin-json-to-csv::[repo]->[isaachvazquez/altair-graphql-plugin-json-to-csv]
```

## Plugin Guides

### [Using Plugins](/docs/plugins/using-plugins)
Comprehensive guide on how to find, install, configure, and manage plugins in Altair.

### [Popular Plugins](/docs/plugins/popular-plugins)
Discover the most useful and popular plugins in the Altair ecosystem.

### [Writing Your Own Plugin](/docs/plugins/writing-plugin)
Learn the basics of creating custom plugins for Altair.

### [Submitting Your Plugin](/docs/plugins/submitting-plugin)
Guidelines for sharing your plugin with the Altair community.

### [Plugin Policy](/docs/plugins/policy)
Rules and guidelines for plugin development and distribution.

## For Plugin Developers

See the [Writing a Plugin](/docs/plugins/writing-plugin) guide for information on creating custom plugins for Altair.

## Community

### Getting Help
- **GitHub Discussions**: Ask questions and get help from the community
- **Issues**: Report bugs or request features for existing plugins
- **Documentation**: Contribute to plugin documentation and guides

### Contributing
- **Plugin Ideas**: Suggest new plugin concepts
- **Code Contributions**: Help improve existing plugins
- **Documentation**: Improve plugin guides and tutorials
- **Testing**: Help test plugins across different environments

Visit our [GitHub repository](https://github.com/altair-graphql/altair) to explore the plugin ecosystem and contribute to the community!
