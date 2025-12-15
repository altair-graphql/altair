---
parent: Features
---

# One-click Query Generation

You can easily add a query (or fragment) you see in the documentation into the editor
without having to manually type every field within the query. This makes it easier to
test and develop with the available queries from the GraphQL server.

![Add query button on hover](/assets/img/docs/altair-add-query.gif)

Clicking the `ADD QUERY` button inserts the query generated based on the schema. You can control how deep (nested) the generated query would be using the [`addQueryDepthLimit`](/api/core/types/state/settings.interfaces/type-aliases/SettingsState#addquerydepthlimit) option (set to 3 by default) in the settings.

This is a query generated with [`addQueryDepthLimit`](/api/core/types/state/settings.interfaces/type-aliases/SettingsState#addquerydepthlimit) set to 2.

![Added query with depth set to 2](/assets/img/docs/added-query-depth-2.png)

This is the same query with [`addQueryDepthLimit`](/api/core/types/state/settings.interfaces/type-aliases/SettingsState#addquerydepthlimit) set to 4.

![Added query with depth set to 4](/assets/img/docs/added-query-depth-4.png)
