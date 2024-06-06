# `abstract` ScriptEvaluatorWorker

## Constructors

### new ScriptEvaluatorWorker()

> **new ScriptEvaluatorWorker**(): [`ScriptEvaluatorWorker`](ScriptEvaluatorWorker.md)

#### Returns

[`ScriptEvaluatorWorker`](ScriptEvaluatorWorker.md)

## Methods

### onError()

> `abstract` **onError**(`handler`: (`err`: `any`) => `void`): `void`

#### Parameters

• **handler**

#### Returns

`void`

***

### onMessage()

> `abstract` **onMessage**(`handler`: (`e`: [`ScriptWorkerMessageData`](../interfaces/ScriptWorkerMessageData.md)) => `void`): `void`

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
