# `abstract` SubscriptionProvider

## Extended by

- [`ActionCableSubscriptionProvider`](../../providers/action-cable/classes/ActionCableSubscriptionProvider.md)
- [`AppSyncSubscriptionProvider`](../../providers/app-sync/classes/AppSyncSubscriptionProvider.md)
- [`GraphQLSSESubscriptionProvider`](../../providers/graphql-sse/classes/GraphQLSSESubscriptionProvider.md)
- [`GraphQLWsSubscriptionProvider`](../../providers/graphql-ws/classes/GraphQLWsSubscriptionProvider.md)
- [`WebsocketSubscriptionProvider`](../../providers/ws/classes/WebsocketSubscriptionProvider.md)

## Constructors

### new SubscriptionProvider()

> **new SubscriptionProvider**(`subscriptionUrl`: `string`, `connectionParams`: [`IDictionary`](../../../types/shared/type-aliases/IDictionary.md), `extraOptions`?: [`SubscriptionProviderExtraOptions`](../interfaces/SubscriptionProviderExtraOptions.md)): [`SubscriptionProvider`](SubscriptionProvider.md)

#### Parameters

• **subscriptionUrl**: `string`

• **connectionParams**: [`IDictionary`](../../../types/shared/type-aliases/IDictionary.md)

• **extraOptions?**: [`SubscriptionProviderExtraOptions`](../interfaces/SubscriptionProviderExtraOptions.md)

#### Returns

[`SubscriptionProvider`](SubscriptionProvider.md)

## Properties

### connectionParams

> `protected` **connectionParams**: [`IDictionary`](../../../types/shared/type-aliases/IDictionary.md)

***

### extraOptions?

> `protected` `optional` **extraOptions**: [`SubscriptionProviderExtraOptions`](../interfaces/SubscriptionProviderExtraOptions.md)

***

### subscriptionUrl

> `protected` **subscriptionUrl**: `string`

## Methods

### close()

> `abstract` **close**(): `void`

#### Returns

`void`

***

### execute()

> `abstract` **execute**(`options`: [`SubscriptionProviderExecuteOptions`](../interfaces/SubscriptionProviderExecuteOptions.md)): `Observable`\<`unknown`\>

#### Parameters

• **options**: [`SubscriptionProviderExecuteOptions`](../interfaces/SubscriptionProviderExecuteOptions.md)

#### Returns

`Observable`\<`unknown`\>
