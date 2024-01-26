---
parent: Features
---

# GraphQL Docs

You can easily view and navigate the documentation for the GraphQL schema, including the descriptions and details for each field and type. This can be especially useful when working with complex schemas that have many nested fields and types, and you want to see detailed information about the data available in the schema.

Altair fetches the docs of all endpoints and fields offered by your GraphQL server (via [introspection](https://graphql.org/learn/introspection/)). This also allows Altair provide several other rich features to you.

_NOTE: You may not want to allow introspection queries for your server in production, and enable it **only in development**. This would mean Altair would have several features disabled because of that but it is better from a security standpoint. Here is a [nice article](https://lab.wallarm.com/why-and-how-to-disable-introspection-query-for-graphql-apis/) around why._

![docs menu](/assets/img/docs/docs-menu.png)

You can load a GraphQL schema directly into Altair docs if for example, you are offline and can't connect to the API, or the API has introspection disabled for security reasons. This allows you to continue using the docs and all other functionality in Altair.
