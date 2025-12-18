---
order: 9
---

# Plugin policy

Altair GraphQL allows for the extension of its functionality through plugins while ensuring the security and privacy of its users. This document outlines the policies that govern the plugins that are published to the Altair plugin registry to ensure that the plugins are safe, secure, and adhere to the best practices for plugin development. By [submitting](/docs/plugins/submitting-plugin) a plugin to the Altair plugin registry, **you agree to abide by these policies**.

::: warning
The Altair GraphQL team reserves the right to remove any plugin that violates these policies or poses a risk to users.

The policy will be reviewed periodically to ensure that it remains up to date with evolving best practices and security standards.
The team may also update these policies without prior notice.
:::

## General

- Plugins must be hosted in a public [GitHub](https://github.com) repository.
- The source code of the plugin must not be obfuscated or minified.
- The source code of the plugin must not contain any malicious code or malware.
- Plugins must be published as public npm packages to the [npm](https://www.npmjs.com) registry with names that begin with `altair-graphql-plugin-`. For example, `altair-graphql-plugin-graphql-explorer` is the name of the [GraphQL explorer plugin](https://www.npmjs.com/package/altair-graphql-plugin-graphql-explorer).
- Plugins must have a `manifest.json` file that defines the plugin structure. The `manifest.json` file should conform to the [PluginV3Manifest](/api/core/plugin/v3/manifest/type-aliases/PluginV3Manifest) interface.
- Plugins must provide clear and accurate documentation on how to use the plugin and what functionality it provides.
- Plusing should be intuitive and easy to use. The user interface should be consistent with the Altair design language and not introduce any jarring or unexpected changes.
- Plugins must be thoroughly tested to ensure that they work as expected and do not introduce any bugs or security vulnerabilities.
- Plugins must be compatible with the latest version of Altair and not break any existing functionality.

## Data handling

- Plugins must only access or process data strictly necessary for their intended function.
- Avoid requesting or storing data that is not essential to the plugin’s purpose.
- Clearly inform users about the type of data a plugin accesses, how that data is used, and any potential sharing with external services.
- Wherever possible, perform data processing locally within the client’s environment to minimize data exposure.
- Plugins should use client-side storage mechanisms judiciously, ensuring that sensitive data is not stored.
- Any data exchanged over the network must use secure protocols (e.g., HTTPS).

## Reporting violations

If you believe that a plugin violates any of the policies outlined in this document, please report it to the developer by opening an issue on the plugin’s GitHub repository. If the issue is not resolved after a reasonable period or if you believe the plugin poses an immediate threat to users, please contact the [Altair GraphQL team](mailto:info@altairgraphql.dev).
