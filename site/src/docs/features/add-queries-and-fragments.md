---
parent: Features
---

# Add Queries and Fragments

You can easily add a query (or fragment) you see in the documentation into the editor
without having to manually type every field within the query. This makes it easier to
test and develop with the available queries from the GraphQL server.

![Add query button on hover](/assets/img/docs/add-query-on-hover.png)

Clicking the `ADD QUERY` button inserts the query generated based on the schema. You can control how deep (nested) the generated query would be using the `addQueryDepthLimit` option (set to 3 by default) in the settings.

This is a query generated with `addQueryDepthLimit` set to 2.

![Added query with depth set to 2](/assets/img/docs/added-query-depth-2.png)

This is the same query with `addQueryDepthLimit` set to 4.

![Added query with depth set to 4](/assets/img/docs/added-query-depth-4.png)
