---
---

# Migrating Altair Browser Extensions to Manifest v3

Altair GraphQL Client comes in various [forms and variants](/docs/features/multiple-platforms) to meet developers where they are. This allows developers use Altair in the way that best suits their workflow. One of the popular ways Altair is used is as a browser extension made available on all the major browsers. This allows developers to interact with their GraphQL APIs from their browser without having to leave the browser, or install an additional application directly on their device. The browser extension also allows developers interact with their cookie authenticated APIs, which reduces the toil of needing a different authentication mechanism from their web app.

The browser extension is built using the Chrome extension API, which has been around for a while and has been the standard for building browser extensions. However, the Chrome extension API has been evolving and the latest version is the [manifest v3](https://blog.chromium.org/2020/12/manifest-v3-now-available-on-m88-beta.html). The manifest v3 is a new version of the Chrome extension API that introduces a number of changes to the way extensions are built and how they interact with the browser. This new version of the API is designed to improve the performance and security of extensions, and to make it easier for developers to build and maintain their extensions. This crackdown on extension security also brought tighter restrictions on the way extensions interact with the browser and the web pages, which also has implications for the Altair browser extensions.

The chrome team has [announced](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline) that the manifest v2 will be deprecated later in 2024, and all extensions will be required to migrate to manifest v3. This means that the Altair browser extension will need to be updated to support manifest v3 in order to continue working on the latest versions of Chrome and other browsers that support the manifest v3 API. We [investigated](https://github.com/altair-graphql/altair/issues/2504) the impact on the Altair browser extension and found that there are a number of changes required to support manifest v3.

## Plugins

The biggest impact for Altair is for [plugins](/docs/plugins/). Manifest version 3 removes the ability to execute remotely hosted code, which is how Altair v1 plugins are currently implemented. This means that the current Altair v1 plugins will **not work** with manifest v3. We have implemented a [new plugin system](/docs/plugins/writing-plugin#v3-plugins) for Altair that leverages the use of iframes with strictly defined communication protocols to allow plugins to run in a secure and isolated environment. This new plugin system is designed to be more secure and more performant than the current system, and to provide a better experience for developers who want to extend Altair with custom functionality, while being compatible with manifest v3.

::: tip
It is recommended that developers who have built plugins for Altair migrate their plugins to the new plugin system in order to continue using them with the latest versions of Altair. We have provided [guidance](/docs/plugins/writing-plugin#supporting-both-v2-and-v3-plugin-formats) on how to smoothen out the transition from the old and new plugin formats.
:::

In the near future, v1 plugins will still be supported in the other platforms like the desktop apps, but the browser extension will only support the new plugin system. However, we will eventually phase out the v1 plugin system in all platforms in order to maintain a consistent experience across all platforms.

## Pre-request scripts

Manifest v3 also has implications for the way pre-request scripts are executed in Altair. Pre-request scripts use `eval` in a local web worker for safe execution of the scripts. However, manifest v3 restricts the use of `eval` (except in sandboxed pages) which means that the current implementation of pre-request scripts will not work with manifest v3. Altair also executes the scripts in a sandboxed iframe whenever the web worker can't be used (e.g. when using Altair from the CDNs). This is a fallback mechanism that will continue to work with manifest v3, but requires an active internet connection to work.
