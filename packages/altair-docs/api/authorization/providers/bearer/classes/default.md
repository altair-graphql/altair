# default

## Extends

- [`AuthorizationProvider`](../../../authorization-provider/classes/AuthorizationProvider.md)\<[`BearerAuthorizationProviderData`](../interfaces/BearerAuthorizationProviderData.md)\>

## Constructors

### new default()

> **new default**(`hydrator`: (`data`: `string`) => `string`): [`default`](default.md)

#### Parameters

• **hydrator**

#### Returns

[`default`](default.md)

#### Inherited from

[`AuthorizationProvider`](../../../authorization-provider/classes/AuthorizationProvider.md).[`constructor`](../../../authorization-provider/classes/AuthorizationProvider.md#constructors)

## Methods

### execute()

> **execute**(`options`: [`AuthorizationProviderExecuteOptions`](../../../authorization-provider/interfaces/AuthorizationProviderExecuteOptions.md)\<[`BearerAuthorizationProviderData`](../interfaces/BearerAuthorizationProviderData.md)\>): `Promise`\<[`AuthorizationResult`](../../../../types/state/authorization.interface/interfaces/AuthorizationResult.md)\>

#### Parameters

• **options**: [`AuthorizationProviderExecuteOptions`](../../../authorization-provider/interfaces/AuthorizationProviderExecuteOptions.md)\<[`BearerAuthorizationProviderData`](../interfaces/BearerAuthorizationProviderData.md)\>

#### Returns

`Promise`\<[`AuthorizationResult`](../../../../types/state/authorization.interface/interfaces/AuthorizationResult.md)\>

#### Overrides

[`AuthorizationProvider`](../../../authorization-provider/classes/AuthorizationProvider.md).[`execute`](../../../authorization-provider/classes/AuthorizationProvider.md#execute)

***

### hydrate()

> **hydrate**(`data`: `string`): `string`

#### Parameters

• **data**: `string`

#### Returns

`string`

#### Inherited from

[`AuthorizationProvider`](../../../authorization-provider/classes/AuthorizationProvider.md).[`hydrate`](../../../authorization-provider/classes/AuthorizationProvider.md#hydrate)
