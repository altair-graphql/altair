---
parent: Features
---

# Custom request headers

Altair provides flexibility by allowing you to set custom request headers, such as authentication tokens.

![header dialog](https://i.imgur.com/dCwAsl4.png)

When you send a query using Altair, the headers will be included in the request. This allows you to easily specify and manage the headers for your GraphQL requests.

### Collection headers

You can set headers to be shared by all queries in a collection. This is particularly useful for common headers like authentication tokens that apply to an entire API or service.

To set collection headers:

1. Open the menu on a collection in the sidebar
2. Select "Edit"
3. Go to the "Headers" tab
4. Add your shared headers

Collection headers will be automatically applied to all queries in that collection, but can be combined with query-specific headers when needed.

### Global environment headers

You can also set global headers via the [global environment](./environment-variables). Just add a `headers` payload with your global headers there and these headers would be applied to all the windows.

![global environment](https://i.imgur.com/uG98IHg.png)
