# WebsocketSubscriptionProvider

## Extends

- [`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md)

## Constructors

### new WebsocketSubscriptionProvider()

> **new WebsocketSubscriptionProvider**(`subscriptionUrl`: `string`, `connectionParams`: [`IDictionary`](../../../../types/shared/type-aliases/IDictionary.md), `extraOptions`?: [`SubscriptionProviderExtraOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExtraOptions.md)): [`WebsocketSubscriptionProvider`](WebsocketSubscriptionProvider.md)

#### Parameters

• **subscriptionUrl**: `string`

• **connectionParams**: [`IDictionary`](../../../../types/shared/type-aliases/IDictionary.md)

• **extraOptions?**: [`SubscriptionProviderExtraOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExtraOptions.md)

#### Returns

[`WebsocketSubscriptionProvider`](WebsocketSubscriptionProvider.md)

#### Inherited from

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`constructor`](../../../subscription-provider/classes/SubscriptionProvider.md#constructors)

## Properties

### cleanup()?

> `optional` **cleanup**: () => `void`

#### Returns

`void`

***

### client?

> `optional` **client**: `SubscriptionClient`

***

### connectionParams

> `protected` **connectionParams**: [`IDictionary`](../../../../types/shared/type-aliases/IDictionary.md)

#### Inherited from

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`connectionParams`](../../../subscription-provider/classes/SubscriptionProvider.md#connectionparams)

***

### extraOptions?

> `protected` `optional` **extraOptions**: [`SubscriptionProviderExtraOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExtraOptions.md)

#### Inherited from

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`extraOptions`](../../../subscription-provider/classes/SubscriptionProvider.md#extraoptions)

***

### subscriptionUrl

> `protected` **subscriptionUrl**: `string`

#### Inherited from

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`subscriptionUrl`](../../../subscription-provider/classes/SubscriptionProvider.md#subscriptionurl)

## Methods

### close()

> **close**(): `void`

#### Returns

`void`

#### Overrides

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`close`](../../../subscription-provider/classes/SubscriptionProvider.md#close)

***

### createClient()

> **createClient**(): `void`

#### Returns

`void`

***

### execute()

> **execute**(`options`: [`SubscriptionProviderExecuteOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExecuteOptions.md)): `Observable`\<`unknown`\>

#### Parameters

• **options**: [`SubscriptionProviderExecuteOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExecuteOptions.md)

#### Returns

`Observable`\<`unknown`\>

#### Overrides

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`execute`](../../../subscription-provider/classes/SubscriptionProvider.md#execute)
