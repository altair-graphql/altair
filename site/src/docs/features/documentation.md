---
parent: Features
---

# GraphQL Docs (via introspection)

Altair fetches the docs of all endpoints and fields offered by your GraphQL server (via [introspection](https://graphql.org/learn/introspection/)) and provides a rich interface to conveniently search through these and gain instant
insight into the structure of the API. This also allows Altair provide several other rich features to you.

_NOTE: You may not want to allow introspection queries for your server in production, and enable it **only in development**. This would mean Altair would have several features disabled because of that but it is better from a security standpoint. Here is a [nice article](https://lab.wallarm.com/why-and-how-to-disable-introspection-query-for-graphql-apis/) around why._
