# `abstract` ValueObject\<T\>

## Extended by

- [`TeamId`](../../../types/state/account.interfaces/classes/TeamId.md)
- [`WorkspaceId`](../../../types/state/workspace.interface/classes/WorkspaceId.md)

## Type parameters

• **T**

## Constructors

### new ValueObject()

> **new ValueObject**\<`T`\>(`props`: `T`): [`ValueObject`](ValueObject.md)\<`T`\>

#### Parameters

• **props**: `T`

#### Returns

[`ValueObject`](ValueObject.md)\<`T`\>

## Properties

### props

> `readonly` **props**: `T`

## Methods

### equals()

> **equals**(`vo`?: [`ValueObject`](ValueObject.md)\<`T`\>): `boolean`

#### Parameters

• **vo?**: [`ValueObject`](ValueObject.md)\<`T`\>

#### Returns

`boolean`

***

### value()

> **value**(): `T`

#### Returns

`T`
