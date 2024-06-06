# ScriptEvaluatorClientEngine

## Constructors

### new ScriptEvaluatorClientEngine()

> **new ScriptEvaluatorClientEngine**(`engineFactory`: [`ScriptEvaluatorClientFactory`](../../types/interfaces/ScriptEvaluatorClientFactory.md), `timeout`: `number`): [`ScriptEvaluatorClientEngine`](ScriptEvaluatorClientEngine.md)

#### Parameters

• **engineFactory**: [`ScriptEvaluatorClientFactory`](../../types/interfaces/ScriptEvaluatorClientFactory.md)

• **timeout**: `number`= `DEFAULT_TIMEOUT`

#### Returns

[`ScriptEvaluatorClientEngine`](ScriptEvaluatorClientEngine.md)

## Methods

### executeScript()

> **executeScript**(`script`: `string`, `data`: [`ScriptContextData`](../../types/interfaces/ScriptContextData.md), `userAvailableHandlers`: [`ScriptEventHandlers`](../../types/interfaces/ScriptEventHandlers.md)): `Promise`\<[`ScriptTranformResult`](../../types/interfaces/ScriptTranformResult.md)\>

#### Parameters

• **script**: `string`

• **data**: [`ScriptContextData`](../../types/interfaces/ScriptContextData.md)

• **userAvailableHandlers**: [`ScriptEventHandlers`](../../types/interfaces/ScriptEventHandlers.md)

#### Returns

`Promise`\<[`ScriptTranformResult`](../../types/interfaces/ScriptTranformResult.md)\>
