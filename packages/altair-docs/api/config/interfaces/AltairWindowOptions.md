# AltairWindowOptions

## Extended by

- [`AltairConfigOptions`](AltairConfigOptions.md)

## Properties

### endpointURL?

> `optional` **endpointURL**: `string`

URL to set as the server endpoint

***

### initialHeaders?

> `optional` **initialHeaders**: [`IDictionary`](../../types/shared/type-aliases/IDictionary.md)

Initial headers object to be added

#### Example

```ts
{
   *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
   * }
```

***

### initialHttpMethod?

> `optional` **initialHttpMethod**: `"POST"` \| `"GET"` \| `"PUT"` \| `"DELETE"`

HTTP method to use for making requests

***

### initialName?

> `optional` **initialName**: `string`

Initial name of the window

***

### initialPostRequestScript?

> `optional` **initialPostRequestScript**: `string`

Initial post-request script to be added

***

### initialPreRequestScript?

> `optional` **initialPreRequestScript**: `string`

Initial pre-request script to be added

***

### initialQuery?

> `optional` **initialQuery**: `string`

Initial query to be added

***

### initialSubscriptionsPayload?

> `optional` **initialSubscriptionsPayload**: [`IDictionary`](../../types/shared/type-aliases/IDictionary.md)

Initial subscriptions connection params

***

### initialSubscriptionsProvider?

> `optional` **initialSubscriptionsProvider**: [`SubscriptionProviderIds`](../../subscriptions/type-aliases/SubscriptionProviderIds.md)

Initial subscriptions provider

#### Default

```ts
"websocket"
```

***

### initialVariables?

> `optional` **initialVariables**: `string`

Initial variables to be added

***

### subscriptionsEndpoint?

> `optional` **subscriptionsEndpoint**: `string`

URL to set as the subscription endpoint. This can be relative or absolute.

***

### subscriptionsProtocol?

> `optional` **subscriptionsProtocol**: `string`

URL protocol for the subscription endpoint. This is used if the specified subscriptions endpoint is relative.
e.g. wss
