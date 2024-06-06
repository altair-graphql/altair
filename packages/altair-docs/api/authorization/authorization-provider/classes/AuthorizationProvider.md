# `abstract` AuthorizationProvider\<T\>

## Extended by

- [`default`](../../providers/api-key/classes/default.md)
- [`default`](../../providers/basic/classes/default.md)
- [`default`](../../providers/bearer/classes/default.md)
- [`default`](../../providers/oauth2/classes/default.md)

## Type parameters

• **T** = `unknown`

## Constructors

### new AuthorizationProvider()

> **new AuthorizationProvider**\<`T`\>(`hydrator`: (`data`: `string`) => `string`): [`AuthorizationProvider`](AuthorizationProvider.md)\<`T`\>

#### Parameters

• **hydrator**

#### Returns

[`AuthorizationProvider`](AuthorizationProvider.md)\<`T`\>

## Methods

### execute()

> `abstract` **execute**(`options`: [`AuthorizationProviderExecuteOptions`](../interfaces/AuthorizationProviderExecuteOptions.md)\<`T`\>): `Promise`\<[`AuthorizationResult`](../../../types/state/authorization.interface/interfaces/AuthorizationResult.md)\>

#### Parameters

• **options**: [`AuthorizationProviderExecuteOptions`](../interfaces/AuthorizationProviderExecuteOptions.md)\<`T`\>

#### Returns

`Promise`\<[`AuthorizationResult`](../../../types/state/authorization.interface/interfaces/AuthorizationResult.md)\>

***

### hydrate()

> **hydrate**(`data`: `string`): `string`

#### Parameters

• **data**: `string`

#### Returns

`string`
