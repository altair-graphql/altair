# IQueryCollection

## Extends

- [`BaseDocument`](../../../shared/interfaces/BaseDocument.md)

## Extended by

- [`IQueryCollectionTree`](IQueryCollectionTree.md)

## Properties

### created\_at?

> `optional` **created\_at**: `number`

#### Inherited from

[`BaseDocument`](../../../shared/interfaces/BaseDocument.md).[`created_at`](../../../shared/interfaces/BaseDocument.md#created_at)

***

### description?

> `optional` **description**: `string`

***

### id

> **id**: `string`

#### Inherited from

[`BaseDocument`](../../../shared/interfaces/BaseDocument.md).[`id`](../../../shared/interfaces/BaseDocument.md#id)

***

### parentPath?

> `optional` **parentPath**: `string`

path of the collection in the collection tree
e.g. '/123/456'

***

### postRequest?

> `optional` **postRequest**: [`PostrequestState`](../../postrequest.interfaces/interfaces/PostrequestState.md)

***

### preRequest?

> `optional` **preRequest**: [`PrerequestState`](../../prerequest.interfaces/interfaces/PrerequestState.md)

***

### queries

> **queries**: [`IQuery`](IQuery.md)[]

***

### storageType?

> `optional` **storageType**: [`EntityStorageType`](../type-aliases/EntityStorageType.md)

***

### title

> **title**: `string`

***

### updated\_at?

> `optional` **updated\_at**: `number`

#### Inherited from

[`BaseDocument`](../../../shared/interfaces/BaseDocument.md).[`updated_at`](../../../shared/interfaces/BaseDocument.md#updated_at)

***

### workspaceId?

> `optional` **workspaceId**: `string`
