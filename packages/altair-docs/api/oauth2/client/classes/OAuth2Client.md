# OAuth2Client

## Constructors

### new OAuth2Client()

> **new OAuth2Client**(`options`: [`OAuth2ClientOptions`](../type-aliases/OAuth2ClientOptions.md)): [`OAuth2Client`](OAuth2Client.md)

#### Parameters

• **options**: [`OAuth2ClientOptions`](../type-aliases/OAuth2ClientOptions.md)

#### Returns

[`OAuth2Client`](OAuth2Client.md)

## Methods

### getAccessTokenFromCode()

> **getAccessTokenFromCode**(`code`: `string`): `Promise`\<[`AccessTokenResponse`](../../types/interfaces/AccessTokenResponse.md) \| [`AccessTokenErrorResponse`](../../types/interfaces/AccessTokenErrorResponse.md)\>

#### Parameters

• **code**: `string`

#### Returns

`Promise`\<[`AccessTokenResponse`](../../types/interfaces/AccessTokenResponse.md) \| [`AccessTokenErrorResponse`](../../types/interfaces/AccessTokenErrorResponse.md)\>

***

### getAuthorizationRedirectResponse()

> **getAuthorizationRedirectResponse**(): `Promise`\<`undefined` \| [`AuthorizationRedirectResponse`](../../types/interfaces/AuthorizationRedirectResponse.md) \| [`AuthorizationRedirectErrorResponse`](../../types/interfaces/AuthorizationRedirectErrorResponse.md)\>

#### Returns

`Promise`\<`undefined` \| [`AuthorizationRedirectResponse`](../../types/interfaces/AuthorizationRedirectResponse.md) \| [`AuthorizationRedirectErrorResponse`](../../types/interfaces/AuthorizationRedirectErrorResponse.md)\>

***

### getAuthorizationUrl()

> **getAuthorizationUrl**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>
