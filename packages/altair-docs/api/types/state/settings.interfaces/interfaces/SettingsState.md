# SettingsState

## Properties

### addQueryDepthLimit

> **addQueryDepthLimit**: `number`

'Add query' functionality depth

***

### alert.disableUpdateNotification?

> `optional` **alert.disableUpdateNotification**: `boolean`

Disable update notification

***

### alert.disableWarnings?

> `optional` **alert.disableWarnings**: `boolean`

Disable warning alerts

***

### beta.disable.newEditor?

> `optional` **beta.disable.newEditor**: `boolean`

Disable new editor beta

***

### beta.disable.newScript?

> `optional` **beta.disable.newScript**: `boolean`

Disable new script beta

***

### disableLineNumbers?

> `optional` **disableLineNumbers**: `boolean`

Disable line numbers

***

### disablePushNotification?

> `optional` **disablePushNotification**: `boolean`

Disable push notifications

***

### editor.shortcuts?

> `optional` **editor.shortcuts**: `Record`\<`string`, `string`\>

Contains shortcut to action mapping

***

### enableExperimental?

> `optional` **enableExperimental**: `boolean`

Enable experimental features.
Note: Might be unstable

***

### enableTablistScrollbar?

> `optional` **enableTablistScrollbar**: `boolean`

Enable the scrollbar in the tab list

***

### historyDepth?

> `optional` **historyDepth**: `number`

Number of items allowed in history pane

***

### language

> **language**: `"en-US"` \| `"fr-FR"` \| `"es-ES"` \| `"cs-CZ"` \| `"de-DE"` \| `"pt-BR"` \| `"ru-RU"` \| `"uk-UA"` \| `"zh-CN"` \| `"ja-JP"` \| `"sr-SP"` \| `"it-IT"` \| `"pl-PL"` \| `"ko-KR"` \| `"ro-RO"` \| `"vi-VN"`

Set language

***

### plugin.list?

> `optional` **plugin.list**: `string`[]

Enabled plugins

***

### request.withCredentials?

> `optional` **request.withCredentials**: `boolean`

Send requests with credentials (cookies)

***

### response.hideExtensions?

> `optional` **response.hideExtensions**: `boolean`

Hides extensions object

***

### schema.reloadOnStart?

> `optional` **schema.reloadOnStart**: `boolean`

Reload schema on app start

***

### script.allowedCookies?

> `optional` **script.allowedCookies**: `string`[]

List of cookies to be accessible in the pre-request script

#### Example

```ts
['cookie1', 'cookie2']
```

#### Default

```ts
[]
```

***

### tabSize

> **tabSize**: `number`

Editor tab size

***

### theme

> **theme**: `string`

Theme

***

### theme.dark?

> `optional` **theme.dark**: `string`

Theme for dark mode

***

### theme.editorFontFamily?

> `optional` **theme.editorFontFamily**: `string`

Editor Font Family

***

### theme.editorFontSize?

> `optional` **theme.editorFontSize**: `number`

Editor Font Size

***

### theme.fontsize?

> `optional` **theme.fontsize**: `number`

Base Font Size
(Default - 24)

***

### themeConfig?

> `optional` **themeConfig**: `RecursivePartial`\<`object` & `object`\>

Theme config object

***

### themeConfig.dark?

> `optional` **themeConfig.dark**: `RecursivePartial`\<`object` & `object`\>

Theme config object for dark mode
