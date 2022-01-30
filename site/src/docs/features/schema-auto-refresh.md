---
parent: Features
---

# Schema auto refresh

Usually you would reload the docs everytime you make a change to your schema on the server, but if your server supports the `X-GraphQL-Event-Stream` header, it should be able to notify Altair to reload the docs automatically.

For more information about schema auto refresh, you can check these resources:

- https://github.com/graphql/graphql-over-http/issues/48
- https://sirmuel.design/a-better-graphql-developer-experience-with-x-graphql-event-stream-1256aef96f24
