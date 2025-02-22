---
order: 8
---

# Submitting a plugin

After [building](/docs/plugins/writing-plugin) and publishing your plugin, you can submit it to the Altair GraphQL plugin registry. This allows other users to discover and use your plugin. Once we have reviewed and approved your plugin, it will be available for installation directly from the Altair app.

## Prerequisites

Before submitting your plugin, ensure that you have read the [plugin policy](/docs/plugins/policy) and you have the following:

- A working plugin that you have tested and verified
- A public [GitHub](https://github.com) repository where your plugin code is hosted
- A published [npm](https://www.npmjs.com) package for your plugin
- A `README.md` file in your repository that describes your plugin and how to use it
- A `manifest.json` file that defines your plugin structure

## Submitting your plugin

To submit your plugin, follow these steps:

<!-- TODO: Update plugins.yaml URL to point to master after merging -->

1. Create a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) adding a new entry to the [plugins.yaml](https://github.com/altair-graphql/altair/blob/9e365c4c7a41e65407abd99f5a01aed97e66fb84/packages/altair-docs/.data/plugins.yaml) file in the Altair repository. Here is an example entry:

   ```yaml
   altair-graphql-plugin-ai:
     id: altair-graphql-plugin-ai
     name: Altair AI
     description: Altair AI plugin for Altair GraphQL
     author: Altair GraphQL <info@altairgraphql.dev>
     repository: https://github.com/altair-graphql/altair/tree/master/plugins/ai
   ```

   - `id`: The unique identifier for your plugin. This should be the same as the name of your plugin.
   - `name`: The display name of your plugin.
   - `description`: A brief description of your plugin.
   - `author`: The author of the plugin.
   - `repository`: The URL to the GitHub repository where your plugin code is hosted.

1. Once you have created the pull request, a member of the Altair team will review your submission. This may take some time, so please be patient. You may be asked to make changes to your plugin before it is approved.
1. If your plugin meets the [requirements](/docs/plugins/policy), it will be approved and merged into the repository. Your plugin will then be available for installation from the Altair app.

If you have any questions or need help with submitting your plugin, please feel free to [reach out](https://github.com/altair-graphql/altair/discussions) to us on GitHub. We are happy to help!
