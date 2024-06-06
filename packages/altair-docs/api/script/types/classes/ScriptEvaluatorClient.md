# `abstract` ScriptEvaluatorClient

## Constructors

### new ScriptEvaluatorClient()

> **new ScriptEvaluatorClient**(): [`ScriptEvaluatorClient`](ScriptEvaluatorClient.md)

#### Returns

[`ScriptEvaluatorClient`](ScriptEvaluatorClient.md)

## Methods

### destroy()

> `abstract` **destroy**(): `void`

#### Returns

`void`

***

### onError()

> `abstract` **onError**(`handler`: (`err`: `any`) => `void`): `void`

#### Parameters

• **handler**

#### Returns

`void`

***

### send()

> `abstract` **send**(`type`: `string`, `payload`: `any`): `void`

#### Parameters

• **type**: `string`

• **payload**: `any`

#### Returns

`void`

***

### sendError()

> **sendError**\<`T`\>(`type`: `T`, `payload`: [`ScriptEventErrorPayload`](../interfaces/ScriptEventErrorPayload.md)): `void`

#### Type parameters

• **T** *extends* keyof [`AllScriptEventHandlers`](../interfaces/AllScriptEventHandlers.md)

#### Parameters

• **type**: `T`

• **payload**: [`ScriptEventErrorPayload`](../interfaces/ScriptEventErrorPayload.md)

#### Returns

`void`

***

### sendResponse()

> **sendResponse**\<`T`\>(`type`: `T`, `payload`: [`ScriptEventResponsePayload`](../interfaces/ScriptEventResponsePayload.md)): `void`

#### Type parameters

• **T** *extends* keyof [`AllScriptEventHandlers`](../interfaces/AllScriptEventHandlers.md)

#### Parameters

• **type**: `T`

• **payload**: [`ScriptEventResponsePayload`](../interfaces/ScriptEventResponsePayload.md)

#### Returns

`void`

***

### subscribe()

> `abstract` **subscribe**\<`T`\>(`type`: `T`, `handler`: (`type`: `T`, `e`: [`ScriptEventData`](../type-aliases/ScriptEventData.md)\<`T`\>) => `void`): `void`

#### Type parameters

• **T** *extends* keyof [`AllScriptEventHandlers`](../interfaces/AllScriptEventHandlers.md)

#### Parameters

• **type**: `T`

• **handler**

#### Returns

`void`
