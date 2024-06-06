# `abstract` EvaluatorWorker

## Extended by

- [`PluginFrameWorker`](../../../plugin/v3/frame-worker/classes/PluginFrameWorker.md)
- [`PluginParentWorker`](../../../plugin/v3/parent-worker/classes/PluginParentWorker.md)

## Constructors

### new EvaluatorWorker()

> **new EvaluatorWorker**(): [`EvaluatorWorker`](EvaluatorWorker.md)

#### Returns

[`EvaluatorWorker`](EvaluatorWorker.md)

## Methods

### destroy()

> `abstract` **destroy**(): `void`

#### Returns

`void`

***

### onError()

> `abstract` **onError**(`handler`: (`err`: `unknown`) => `void`): `void`

#### Parameters

• **handler**

#### Returns

`void`

***

### onMessage()

> `abstract` **onMessage**\<`T`, `P`\>(`handler`: (`e`: [`EventData`](../interfaces/EventData.md)\<`T`, `P`\>) => `void`): `void`

#### Type parameters

• **T** *extends* `string`

• **P** = `unknown`

#### Parameters

• **handler**

#### Returns

`void`

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

***

### send()

> `abstract` **send**\<`T`\>(`type`: `T`, `payload`?: `unknown`): `void`

#### Type parameters

• **T** *extends* `string`

#### Parameters

• **type**: `T`

• **payload?**: `unknown`

#### Returns

`void`

***

### subscribe()

> **subscribe**\<`T`, `P`\>(`type`: `T`, `handler`: (`type`: `T`, `e`: [`EventData`](../interfaces/EventData.md)\<`T`, `P`\>) => `void`): `void`

#### Type parameters

• **T** *extends* `string`

• **P** = `unknown`

#### Parameters

• **type**: `T`

• **handler**

#### Returns

`void`
