# PluginFrameWorker

## Extends

- [`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md)

## Constructors

### new PluginFrameWorker()

> **new PluginFrameWorker**(): [`PluginFrameWorker`](PluginFrameWorker.md)

#### Returns

[`PluginFrameWorker`](PluginFrameWorker.md)

#### Overrides

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`constructor`](../../../../evaluator/worker/classes/EvaluatorWorker.md#constructors)

## Methods

### destroy()

> **destroy**(): `void`

#### Returns

`void`

#### Overrides

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`destroy`](../../../../evaluator/worker/classes/EvaluatorWorker.md#destroy)

***

### getInstanceType()

> **getInstanceType**(): [`InstanceType`](../type-aliases/InstanceType.md)

#### Returns

[`InstanceType`](../type-aliases/InstanceType.md)

***

### getParams()

> **getParams**(): [`FrameQueryParams`](../interfaces/FrameQueryParams.md)

#### Returns

[`FrameQueryParams`](../interfaces/FrameQueryParams.md)

***

### onError()

> **onError**(`handler`: (`err`: `any`) => `void`): `void`

#### Parameters

• **handler**

#### Returns

`void`

#### Overrides

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`onError`](../../../../evaluator/worker/classes/EvaluatorWorker.md#onerror)

***

### onMessage()

> **onMessage**\<`T`, `P`\>(`handler`: (`e`: [`EventData`](../../../../evaluator/worker/interfaces/EventData.md)\<`T`, `P`\>) => `void`): `void`

#### Type parameters

• **T** *extends* `string`

• **P** = `unknown`

#### Parameters

• **handler**

#### Returns

`void`

#### Overrides

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`onMessage`](../../../../evaluator/worker/classes/EvaluatorWorker.md#onmessage)

***

### request()

> **request**\<`T`, `R`\>(`type`: `T`, ...`args`: `unknown`[]): `Promise`\<`undefined` \| `R`\>

#### Type parameters

• **T** *extends* `string`

• **R** = `unknown`

#### Parameters

• **type**: `T`

• ...**args**: `unknown`[]

#### Returns

`Promise`\<`undefined` \| `R`\>

#### Inherited from

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`request`](../../../../evaluator/worker/classes/EvaluatorWorker.md#request)

***

### respond()

> **respond**\<`T`, `R`\>(`type`: `T`, `handler`: (...`args`: `unknown`[]) => `Promise`\<`R`\>): `void`

#### Type parameters

• **T** *extends* `string`

• **R** = `unknown`

#### Parameters

• **type**: `T`

• **handler**

#### Returns

`void`

#### Inherited from

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`respond`](../../../../evaluator/worker/classes/EvaluatorWorker.md#respond)

***

### send()

> **send**(`type`: `string`, `payload`: `any`): `void`

#### Parameters

• **type**: `string`

• **payload**: `any`

#### Returns

`void`

#### Overrides

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`send`](../../../../evaluator/worker/classes/EvaluatorWorker.md#send)

***

### subscribe()

> **subscribe**\<`T`, `P`\>(`type`: `T`, `handler`: (`type`: `T`, `e`: [`EventData`](../../../../evaluator/worker/interfaces/EventData.md)\<`T`, `P`\>) => `void`): `void`

#### Type parameters

• **T** *extends* `string`

• **P** = `unknown`

#### Parameters

• **type**: `T`

• **handler**

#### Returns

`void`

#### Inherited from

[`EvaluatorWorker`](../../../../evaluator/worker/classes/EvaluatorWorker.md).[`subscribe`](../../../../evaluator/worker/classes/EvaluatorWorker.md#subscribe)
