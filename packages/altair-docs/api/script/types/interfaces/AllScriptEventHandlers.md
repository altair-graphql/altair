# AllScriptEventHandlers

## Extends

- [`ScriptEventHandlers`](ScriptEventHandlers.md)

## Properties

### alert()

> **alert**: (`msg`: `string`) => `Promise`\<`void`\>

#### Parameters

• **msg**: `string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`alert`](ScriptEventHandlers.md#alert)

***

### executeComplete()

> **executeComplete**: (`data`: [`ScriptContextData`](ScriptContextData.md)) => `void`

#### Parameters

• **data**: [`ScriptContextData`](ScriptContextData.md)

#### Returns

`void`

***

### getStorageItem()

> **getStorageItem**: (`key`: `string`) => `Promise`\<`unknown`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`getStorageItem`](ScriptEventHandlers.md#getstorageitem)

***

### log()

> **log**: (`d`: `unknown`) => `Promise`\<`void`\>

#### Parameters

• **d**: `unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`log`](ScriptEventHandlers.md#log)

***

### request()

> **request**: (`arg1`: `any`, `arg2`: `any`, `arg3`: `any`) => `Promise`\<`any`\>

#### Parameters

• **arg1**: `any`

• **arg2**: `any`

• **arg3**: `any`

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`request`](ScriptEventHandlers.md#request)

***

### scriptError()

> **scriptError**: (`err`: `Error`) => `void`

#### Parameters

• **err**: `Error`

#### Returns

`void`

***

### setCookie()

> **setCookie**: (`key`: `string`, `value`: `string`, `options`?: [`CookieOptions`](CookieOptions.md)) => `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

• **options?**: [`CookieOptions`](CookieOptions.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`setCookie`](ScriptEventHandlers.md#setcookie)

***

### setStorageItem()

> **setStorageItem**: (`key`: `string`, `value`: `unknown`) => `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`setStorageItem`](ScriptEventHandlers.md#setstorageitem)

***

### updateActiveEnvironment()

> **updateActiveEnvironment**: (`environmentData`: `Record`\<`string`, `unknown`\>) => `Promise`\<`void`\>

#### Parameters

• **environmentData**: `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ScriptEventHandlers`](ScriptEventHandlers.md).[`updateActiveEnvironment`](ScriptEventHandlers.md#updateactiveenvironment)
