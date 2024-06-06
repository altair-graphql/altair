# ScriptEventHandlers

## Extended by

- [`AllScriptEventHandlers`](AllScriptEventHandlers.md)

## Properties

### alert()

> **alert**: (`msg`: `string`) => `Promise`\<`void`\>

#### Parameters

• **msg**: `string`

#### Returns

`Promise`\<`void`\>

***

### getStorageItem()

> **getStorageItem**: (`key`: `string`) => `Promise`\<`unknown`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`unknown`\>

***

### log()

> **log**: (`d`: `unknown`) => `Promise`\<`void`\>

#### Parameters

• **d**: `unknown`

#### Returns

`Promise`\<`void`\>

***

### request()

> **request**: (`arg1`: `any`, `arg2`: `any`, `arg3`: `any`) => `Promise`\<`any`\>

#### Parameters

• **arg1**: `any`

• **arg2**: `any`

• **arg3**: `any`

#### Returns

`Promise`\<`any`\>

***

### setCookie()

> **setCookie**: (`key`: `string`, `value`: `string`, `options`?: [`CookieOptions`](CookieOptions.md)) => `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

• **options?**: [`CookieOptions`](CookieOptions.md)

#### Returns

`Promise`\<`void`\>

***

### setStorageItem()

> **setStorageItem**: (`key`: `string`, `value`: `unknown`) => `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `unknown`

#### Returns

`Promise`\<`void`\>

***

### updateActiveEnvironment()

> **updateActiveEnvironment**: (`environmentData`: `Record`\<`string`, `unknown`\>) => `Promise`\<`void`\>

#### Parameters

• **environmentData**: `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>
