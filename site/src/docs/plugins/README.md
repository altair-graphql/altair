---
title: Introduction
has_children: true
permalink: /docs/plugins
order: 3
---

# Plugins

Altair comes with the ability to be extended via plugins. These allow you customize the functionality provided by Altair to be able to do even more than what is directly available in Altair.

Plugins can be added by adding them to the `plugin.list` options in the settings. Alternatively, you can discover available plugins to use from the plugin manager and add the plugin from there (which does the same thing).

![plugin manager icon](https://i.imgur.com/H0eqhvy.png)

![plugin manager](https://i.imgur.com/8zTpbTq.png)

Adding plugins to the settings uses the following format:

`<plugin-source>:<plugin-name>@<version>::[<opt>]->[<opt-value>]`

**Plugin source:** Altair supports several sources for plugins: `[npm](https://www.npmjs.com/)` (default), `[github](https://github.com/)` and `url`. Released plugins should be available in npm so all plugins are sourced from npm by default. If you specify the source as `url`, then you need to specify an `opt` for the url such as `[url]->[http://localhost:8080]`. If you specify the source as `github`, then you need to specify an `opt` for the repo to be used such as `[repo]->[imolorhe/altair]`

**Plugin name:** Every plugin must have a name, used to uniquely identify the plugin. Every plugin name must begin with `altair-graphql-plugin-` else Altair would throw an error.

**Version:** You can choose to specify the version of the plugin you want to use. If no version is specified, Altair defaults to use the latest version of the plugin available.

**Extra options:** Depending on the plugin source specified, you can specify extra options as required. All options follow the format `[opt]->[value]`. For example, `[repo]->[imolorhe/altair]`.

In its simplest form, you can retrieve a plugin by specifying only the plugin name, then the default version (latest) and source (npm) are used. The following are valid examples of ways to use plugins:

```yaml
# loads "altair-graphql-plugin-graphql-explorer" plugin from npm using the latest version
altair-graphql-plugin-graphql-explorer

# loads "altair-graphql-plugin-some-plugin" plugin from the localhost URL. Version is ignored
url:altair-graphql-plugin-some-plugin@0.0.1::[url]->[http://localhost:8002]

# loads "altair-graphql-plugin-json-to-csv" plugin from github from the specified repo
github:altair-graphql-plugin-json-to-csv::[repo]->[isaachvazquez/altair-graphql-plugin-json-to-csv]

```
