# NoExtraProperties\<T, U\>

> **NoExtraProperties**\<`T`, `U`\>: `U` *extends* infer V[] ? [`NoExtraProperties`](NoExtraProperties.md)\<`V`\>[] : `U` & `Impossible`\<`Exclude`\<keyof `U`, keyof `T`\>\>

## Type parameters

• **T**

• **U** *extends* `T` = `T`
