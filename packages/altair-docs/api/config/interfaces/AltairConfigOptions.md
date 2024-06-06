# AltairConfigOptions

## Extends

- [`AltairWindowOptions`](AltairWindowOptions.md)

## Properties

### disableAccount?

> `optional` **disableAccount**: `boolean`

Disable the account and remote syncing functionality

***

### endpointURL?

> `optional` **endpointURL**: `string`

URL to set as the server endpoint

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`endpointURL`](AltairWindowOptions.md#endpointurl)

***

### initialEnvironments?

> `optional` **initialEnvironments**: [`IInitialEnvironments`](../../types/state/environments.interfaces/interfaces/IInitialEnvironments.md)

Initial Environments to be added

#### Example

```ts
{
   *   base: {
   *     title: 'Environment',
   *     variables: {}
   *   },
   *   subEnvironments: [
   *     {
   *       title: 'sub-1',
   *       variables: {}
   *     }
   *   ]
   * }
```

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

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialHeaders`](AltairWindowOptions.md#initialheaders)

***

### initialHttpMethod?

> `optional` **initialHttpMethod**: `"POST"` \| `"GET"` \| `"PUT"` \| `"DELETE"`

HTTP method to use for making requests

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialHttpMethod`](AltairWindowOptions.md#initialhttpmethod)

***

### initialName?

> `optional` **initialName**: `string`

Initial name of the window

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialName`](AltairWindowOptions.md#initialname)

***

### initialPostRequestScript?

> `optional` **initialPostRequestScript**: `string`

Initial post-request script to be added

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialPostRequestScript`](AltairWindowOptions.md#initialpostrequestscript)

***

### initialPreRequestScript?

> `optional` **initialPreRequestScript**: `string`

Initial pre-request script to be added

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialPreRequestScript`](AltairWindowOptions.md#initialprerequestscript)

***

### initialQuery?

> `optional` **initialQuery**: `string`

Initial query to be added

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialQuery`](AltairWindowOptions.md#initialquery)

***

### initialSettings?

> `optional` **initialSettings**: `Partial`\<[`SettingsState`](../../types/state/settings.interfaces/interfaces/SettingsState.md)\>

Initial app settings to use

***

### initialSubscriptionsPayload?

> `optional` **initialSubscriptionsPayload**: [`IDictionary`](../../types/shared/type-aliases/IDictionary.md)

Initial subscriptions connection params

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialSubscriptionsPayload`](AltairWindowOptions.md#initialsubscriptionspayload)

***

### initialSubscriptionsProvider?

> `optional` **initialSubscriptionsProvider**: [`SubscriptionProviderIds`](../../subscriptions/type-aliases/SubscriptionProviderIds.md)

Initial subscriptions provider

#### Default

```ts
"websocket"
```

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialSubscriptionsProvider`](AltairWindowOptions.md#initialsubscriptionsprovider)

***

### initialVariables?

> `optional` **initialVariables**: `string`

Initial variables to be added

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`initialVariables`](AltairWindowOptions.md#initialvariables)

***

### initialWindows?

> `optional` **initialWindows**: [`AltairWindowOptions`](AltairWindowOptions.md)[]

List of options for windows to be loaded

***

### instanceStorageNamespace?

> `optional` **instanceStorageNamespace**: `string`

Namespace for storing the data for the altair instance.
Use this when you have multiple altair instances running on the same domain.

#### Example

```ts
instanceStorageNamespace: 'altair_dev_'
```

***

### persistedSettings?

> `optional` **persistedSettings**: `Partial`\<[`SettingsState`](../../types/state/settings.interfaces/interfaces/SettingsState.md)\>

Persisted settings for the app. The settings will be merged with the app settings.

***

### preserveState?

> `optional` **preserveState**: `boolean`

Indicates if the state should be preserved for subsequent app loads

#### Default

```ts
true
```

***

### subscriptionsEndpoint?

> `optional` **subscriptionsEndpoint**: `string`

URL to set as the subscription endpoint. This can be relative or absolute.

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`subscriptionsEndpoint`](AltairWindowOptions.md#subscriptionsendpoint)

***

### subscriptionsProtocol?

> `optional` **subscriptionsProtocol**: `string`

URL protocol for the subscription endpoint. This is used if the specified subscriptions endpoint is relative.
e.g. wss

#### Inherited from

[`AltairWindowOptions`](AltairWindowOptions.md).[`subscriptionsProtocol`](AltairWindowOptions.md#subscriptionsprotocol)
