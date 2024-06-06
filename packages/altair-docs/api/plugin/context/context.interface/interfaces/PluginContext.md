# PluginContext

## Properties

### app

> **app**: `object`

#### addSubscriptionProvider()

##### Parameters

• **providerData**: [`SubscriptionProviderData`](../../../../subscriptions/interfaces/SubscriptionProviderData.md)

##### Returns

`void`

#### createAction()

action has 1 location for now: resultpane

Each call creates a new action. Instead, plugins should create action once, when needed
Action can be destroyed when the plugin decides to.

returns action instance (includes destroy() method)

##### Parameters

• **options**: [`CreateActionOptions`](CreateActionOptions.md)

##### Returns

[`AltairUiAction`](../../../ui-action/classes/AltairUiAction.md)

#### createPanel()

panel has two locations: sidebar, header

Each call creates a new panel. Instead, plugin should create panel only once (@initialize)
Panel can be destroyed when the plugin is unused.

returns panel instance (includes destroy() method)

##### Parameters

• **element**: `HTMLElement`

• **options?**: [`CreatePanelOptions`](CreatePanelOptions.md)

##### Returns

[`AltairPanel`](../../../panel/classes/AltairPanel.md)

#### createWindow()

##### Parameters

• **data**: [`ExportWindowState`](../../../../types/state/window.interfaces/interfaces/ExportWindowState.md)

##### Returns

`void`

#### destroyAction()

##### Parameters

• **uiAction**: [`AltairUiAction`](../../../ui-action/classes/AltairUiAction.md)

##### Returns

`void`

#### destroyPanel()

##### Parameters

• **panel**: [`AltairPanel`](../../../panel/classes/AltairPanel.md)

##### Returns

`void`

#### executeCommand()

##### Returns

`void`

#### getCurrentWindowState()

##### Returns

`Promise`\<`undefined` \| [`PluginWindowState`](PluginWindowState.md)\>

#### getWindowState()

Returns an allowed set of data from the state visible to plugins

Since it is a method, the state can be generated when called.
So we can ensure uniqueness of the state, as well as avoid passing values by references.

##### Parameters

• **windowId**: `string`

##### Returns

`Promise`\<`undefined` \| [`PluginWindowState`](PluginWindowState.md)\>

#### isElectron()

##### Returns

`boolean`

#### setEndpoint()

##### Parameters

• **windowId**: `string`

• **url**: `string`

##### Returns

`void`

#### setHeader()

##### Parameters

• **windowId**: `string`

• **key**: `string`

• **value**: `string`

##### Returns

`void`

#### setQuery()

##### Parameters

• **windowId**: `string`

• **query**: `string`

##### Returns

`void`

#### setVariables()

##### Parameters

• **windowId**: `string`

• **variables**: `string`

##### Returns

`void`

***

### events

> **events**: `object`

#### off()

##### Returns

`void`

#### on()

##### Type parameters

• **E** *extends* keyof [`PluginEventPayloadMap`](../../../event/event.interfaces/interfaces/PluginEventPayloadMap.md)

##### Parameters

• **event**: `E`

• **callback**: [`PluginEventCallback`](../../../event/event.interfaces/type-aliases/PluginEventCallback.md)\<`E`\>

##### Returns

`object`

###### unsubscribe()

> **unsubscribe**: () => `void`

###### Returns

`void`

***

### theme

> **theme**: `object`

#### add()

##### Parameters

• **name**: `string`

• **theme**: `RecursivePartial`\<`object` & `object`\>

##### Returns

`void`

#### enable()

##### Parameters

• **name**: `string`

• **darkMode?**: `boolean`

##### Returns

`Promise`\<`void`\>
