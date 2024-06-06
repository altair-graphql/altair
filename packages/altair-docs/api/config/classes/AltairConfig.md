# AltairConfig

## Constructors

### new AltairConfig()

> **new AltairConfig**(`__namedParameters`: [`AltairConfigOptions`](../interfaces/AltairConfigOptions.md)): [`AltairConfig`](AltairConfig.md)

#### Parameters

• **\_\_namedParameters**: [`AltairConfigOptions`](../interfaces/AltairConfigOptions.md)= `{}`

#### Returns

[`AltairConfig`](AltairConfig.md)

## Properties

### add\_query\_depth\_limit

> **add\_query\_depth\_limit**: `number` = `3`

***

### defaultTheme

> **defaultTheme**: `string` = `'system'`

***

### default\_language

> **default\_language**: `string`

***

### disableLineNumbers

> **disableLineNumbers**: `boolean` = `false`

***

### donation

> **donation**: `object`

#### action\_count\_threshold

> **action\_count\_threshold**: `number` = `50`

#### url

> **url**: `string` = `'https://opencollective.com/altair/donate'`

***

### ga

> **ga**: `string` = `'UA-41432833-6'`

***

### initialData

> **initialData**: `object`

#### disableAccount

> **disableAccount**: `boolean` = `false`

#### environments

> **environments**: [`IInitialEnvironments`](../../types/state/environments.interfaces/interfaces/IInitialEnvironments.md)

#### headers

> **headers**: [`IDictionary`](../../types/shared/type-aliases/IDictionary.md)

#### initialHttpMethod

> **initialHttpMethod**: `"POST"` \| `"GET"` \| `"PUT"` \| `"DELETE"`

#### initialSubscriptionsPayload

> **initialSubscriptionsPayload**: [`IDictionary`](../../types/shared/type-aliases/IDictionary.md)

#### initialSubscriptionsProvider

> **initialSubscriptionsProvider**: `undefined` \| [`SubscriptionProviderIds`](../../subscriptions/type-aliases/SubscriptionProviderIds.md)

#### instanceStorageNamespace

> **instanceStorageNamespace**: `string` = `'altair_'`

#### persistedSettings

> **persistedSettings**: `undefined` \| `Partial`\<[`SettingsState`](../../types/state/settings.interfaces/interfaces/SettingsState.md)\>

#### postRequestScript

> **postRequestScript**: `string` = `''`

#### preRequestScript

> **preRequestScript**: `string` = `''`

#### preserveState

> **preserveState**: `boolean` = `true`

#### query

> **query**: `string` = `''`

#### settings

> **settings**: `undefined` \| `Partial`\<[`SettingsState`](../../types/state/settings.interfaces/interfaces/SettingsState.md)\>

#### subscriptionsEndpoint

> **subscriptionsEndpoint**: `string` = `''`

#### subscriptionsProtocol

> **subscriptionsProtocol**: `string` = `''`

#### url

> **url**: `string` = `''`

#### variables

> **variables**: `string` = `''`

#### windows

> **windows**: [`AltairWindowOptions`](../interfaces/AltairWindowOptions.md)[]

***

### isTranslateMode

> **isTranslateMode**: `any`

***

### isWebApp

> **isWebApp**: `any`

***

### languages

> **languages**: `object`

#### cs-CZ

> **cs-CZ**: `string` = `'Czech'`

#### de-DE

> **de-DE**: `string` = `'German'`

#### en-US

> **en-US**: `string` = `'English'`

#### es-ES

> **es-ES**: `string` = `'Español'`

#### fr-FR

> **fr-FR**: `string` = `'French'`

#### it-IT

> **it-IT**: `string` = `'Italian'`

#### ja-JP

> **ja-JP**: `string` = `'Japanese'`

#### ko-KR

> **ko-KR**: `string` = `'Korean'`

#### pl-PL

> **pl-PL**: `string` = `'Polish'`

#### pt-BR

> **pt-BR**: `string` = `'Brazilian'`

#### ro-RO

> **ro-RO**: `string` = `'Romanian'`

#### ru-RU

> **ru-RU**: `string` = `'Russian'`

#### sr-SP

> **sr-SP**: `string` = `'Serbian'`

#### uk-UA

> **uk-UA**: `string` = `'Ukrainian'`

#### vi-VN

> **vi-VN**: `string` = `'Vietnamese'`

#### zh-CN

> **zh-CN**: `string` = `'Chinese Simplified'`

***

### max\_windows

> **max\_windows**: `number`

***

### query\_history\_depth

> **query\_history\_depth**: `number`

***

### tab\_size

> **tab\_size**: `number` = `2`

***

### themes

> **themes**: `string`[]
