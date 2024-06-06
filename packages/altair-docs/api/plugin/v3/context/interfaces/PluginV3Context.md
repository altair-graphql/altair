# PluginV3Context

## Methods

### addTheme()

> **addTheme**(`name`: `string`, `theme`: `RecursivePartial`\<`object` & `object`\>): `Promise`\<`void`\>

Add a custom theme to the app

#### Parameters

• **name**: `string`

• **theme**: `RecursivePartial`\<`object` & `object`\>

#### Returns

`Promise`\<`void`\>

***

### createAction()

> **createAction**(`options`: [`CreateActionOptions`](../../../context/context.interface/interfaces/CreateActionOptions.md)): `Promise`\<`undefined` \| `string`\>

Adds a button in the app to perform an action.
The action is defined by the plugin and is executed when the button is clicked.

This returns the unique id of the action.

#### Parameters

• **options**: [`CreateActionOptions`](../../../context/context.interface/interfaces/CreateActionOptions.md)

#### Returns

`Promise`\<`undefined` \| `string`\>

***

### createPanel()

> **createPanel**(`panelName`: `string`, `options`?: [`CreatePanelOptions`](../../../context/context.interface/interfaces/CreatePanelOptions.md)): `Promise`\<`undefined` \| `string`\>

Create an AltairPanel instance for displaying content in the app based on the panel name.
The panel names are defined in the plugin options when the plugin is initialized.

This returns the unique id of the panel.

#### Parameters

• **panelName**: `string`

• **options?**: [`CreatePanelOptions`](../../../context/context.interface/interfaces/CreatePanelOptions.md)

#### Returns

`Promise`\<`undefined` \| `string`\>

***

### createWindow()

> **createWindow**(`data`: [`ExportWindowState`](../../../../types/state/window.interfaces/interfaces/ExportWindowState.md)): `Promise`\<`void`\>

Create a new window in the app with the given data

#### Parameters

• **data**: [`ExportWindowState`](../../../../types/state/window.interfaces/interfaces/ExportWindowState.md)

#### Returns

`Promise`\<`void`\>

***

### destroyAction()

> **destroyAction**(`actionId`: `string`): `Promise`\<`void`\>

Destroy an action based on its unique id

#### Parameters

• **actionId**: `string`

#### Returns

`Promise`\<`void`\>

***

### destroyPanel()

> **destroyPanel**(`panelId`: `string`): `Promise`\<`void`\>

Destroy a panel based on its unique id

#### Parameters

• **panelId**: `string`

#### Returns

`Promise`\<`void`\>

***

### enableTheme()

> **enableTheme**(`name`: `string`, `darkMode`?: `boolean`): `Promise`\<`void`\>

Enable a theme in the app

#### Parameters

• **name**: `string`

• **darkMode?**: `boolean`

#### Returns

`Promise`\<`void`\>

***

### getCurrentWindowState()

> **getCurrentWindowState**(): `Promise`\<`undefined` \| [`PluginWindowState`](../../../context/context.interface/interfaces/PluginWindowState.md)\>

Returns data about the current window (tab) in the app

#### Returns

`Promise`\<`undefined` \| [`PluginWindowState`](../../../context/context.interface/interfaces/PluginWindowState.md)\>

***

### getWindowState()

> **getWindowState**(`windowId`: `string`): `Promise`\<`undefined` \| [`PluginWindowState`](../../../context/context.interface/interfaces/PluginWindowState.md)\>

Returns data about a window (tab) in the app

#### Parameters

• **windowId**: `string`

#### Returns

`Promise`\<`undefined` \| [`PluginWindowState`](../../../context/context.interface/interfaces/PluginWindowState.md)\>

***

### isElectron()

> **isElectron**(): `Promise`\<`boolean`\>

Check if the app is running in an Electron environment

#### Returns

`Promise`\<`boolean`\>

***

### off()

> **off**(): `void`

Remove all the event listeners

#### Returns

`void`

***

### on()

> **on**\<`E`\>(`event`: `E`, `callback`: [`PluginEventCallback`](../../../event/event.interfaces/type-aliases/PluginEventCallback.md)\<`E`\>): `object`

Subscribe to an event in the app

#### Type parameters

• **E** *extends* keyof [`PluginEventPayloadMap`](../../../event/event.interfaces/interfaces/PluginEventPayloadMap.md)

#### Parameters

• **event**: `E`

• **callback**: [`PluginEventCallback`](../../../event/event.interfaces/type-aliases/PluginEventCallback.md)\<`E`\>

#### Returns

`object`

##### unsubscribe()

> **unsubscribe**: () => `void`

###### Returns

`void`

***

### setEndpoint()

> **setEndpoint**(`windowId`: `string`, `url`: `string`): `Promise`\<`void`\>

Set the endpoint in the app for the given window

#### Parameters

• **windowId**: `string`

• **url**: `string`

#### Returns

`Promise`\<`void`\>

***

### setHeader()

> **setHeader**(`windowId`: `string`, `key`: `string`, `value`: `string`): `Promise`\<`void`\>

Add a header in the app for the given window

#### Parameters

• **windowId**: `string`

• **key**: `string`

• **value**: `string`

#### Returns

`Promise`\<`void`\>

***

### setQuery()

> **setQuery**(`windowId`: `string`, `query`: `string`): `Promise`\<`void`\>

Set the query in the app for the given window

#### Parameters

• **windowId**: `string`

• **query**: `string`

#### Returns

`Promise`\<`void`\>

***

### setVariables()

> **setVariables**(`windowId`: `string`, `variables`: `string`): `Promise`\<`void`\>

Set the variables in the app for the given window

#### Parameters

• **windowId**: `string`

• **variables**: `string`

#### Returns

`Promise`\<`void`\>
