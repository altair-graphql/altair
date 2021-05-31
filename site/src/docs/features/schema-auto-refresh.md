---
parent: Features
---

# Schema auto refresh

Usually you would reload the docs everytime you make a change to your schema on the server, but if your server supports the `X-GraphQL-Event-Stream` header, it should be able to notify Altair to reload the docs automatically.
