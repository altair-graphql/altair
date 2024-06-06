# AppSyncSubscriptionProvider

## Extends

- [`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md)

## Constructors

### new AppSyncSubscriptionProvider()

> **new AppSyncSubscriptionProvider**(`subscriptionUrl`: `string`, `connectionParams`: [`IDictionary`](../../../../types/shared/type-aliases/IDictionary.md), `extraOptions`?: [`SubscriptionProviderExtraOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExtraOptions.md)): [`AppSyncSubscriptionProvider`](AppSyncSubscriptionProvider.md)

#### Parameters

• **subscriptionUrl**: `string`

• **connectionParams**: [`IDictionary`](../../../../types/shared/type-aliases/IDictionary.md)

• **extraOptions?**: [`SubscriptionProviderExtraOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExtraOptions.md)

#### Returns

[`AppSyncSubscriptionProvider`](AppSyncSubscriptionProvider.md)

#### Inherited from

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`constructor`](../../../subscription-provider/classes/SubscriptionProvider.md#constructors)

## Properties

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

### subscription?

> `optional` **subscription**: `Subscription`

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

### execute()

> **execute**(`options`: [`SubscriptionProviderExecuteOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExecuteOptions.md)): `Observable`\<`unknown`\>

{
  "aws_project_region": "us-west-2",
  "aws_appsync_graphqlEndpoint": "https://....appsync-api.us-west-2.amazonaws.com/graphql",
  "aws_appsync_region": "us-west-2",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "..."
  "aws_appsync_jwtToken" "..."
}

#### Parameters

• **options**: [`SubscriptionProviderExecuteOptions`](../../../subscription-provider/interfaces/SubscriptionProviderExecuteOptions.md)

#### Returns

`Observable`\<`unknown`\>

#### Overrides

[`SubscriptionProvider`](../../../subscription-provider/classes/SubscriptionProvider.md).[`execute`](../../../subscription-provider/classes/SubscriptionProvider.md#execute)
