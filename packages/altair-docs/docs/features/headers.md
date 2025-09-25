---
parent: Features
---

# Custom request headers

Altair provides flexibility by allowing you to set custom request headers, such as authentication tokens.

![header dialog](https://i.imgur.com/dCwAsl4.png)

When you send a query using Altair, the headers will be included in the request. This allows you to easily specify and manage the headers for your GraphQL requests.

## Header inheritance

Altair supports a hierarchical header inheritance system with the following priority order (highest to lowest):

1. **Query-specific headers** - Headers set directly on an individual query window
2. **Collection headers** - Headers shared by all queries in a collection  
3. **Global environment headers** - Headers set in the global environment

### Collection headers

You can set headers to be shared by all queries in a collection. This is particularly useful for common headers like authentication tokens that apply to an entire API or service.

To set collection headers:
1. Right-click on a collection in the sidebar
2. Select "Edit Collection" 
3. Go to the "Headers" tab
4. Add your shared headers

Collection headers will be automatically applied to all queries in that collection, but can be overridden by query-specific headers when needed.

### Global environment headers

You can also set global headers via the [global environment](./environment-variables). Just add a `headers` payload with your global headers there and these headers would be applied to all the windows.

![global environment](https://i.imgur.com/uG98IHg.png)

## Header priority and inheritance

When multiple header sources define the same header key, the priority order determines which value is used:

1. Query-specific headers take precedence over collection headers
2. Collection headers take precedence over global environment headers  
3. Global environment headers are applied first as the base layer

This allows you to set common defaults at the collection or environment level while still being able to override them for specific queries when needed.
