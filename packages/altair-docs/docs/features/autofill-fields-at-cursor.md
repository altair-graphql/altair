---
parent: Features
---

# Autofill fields

You can easily and efficiently add all of the fields for a given type in the schema to your query. This can be especially useful when working with complex schemas that have many nested fields and types, and you want to include all of the available data in your query.

To do this, use the keyboard shortcut (`Ctrl+Shift+Enter`) or select "Fill all fields" from the autocomplete menu. This will cause Altair to automatically add all of the available fields for the type at the current cursor position to the query, without having to manually type out each field.

::: tip
Note: You can change the autocompletion depth limit using a [`addQueryDepthLimit`](/api/core/types/state/settings.interfaces/interfaces/SettingsState#addquerydepthlimit) option in the settings.
:::

![Autofill fields](/assets/img/docs/autofill-fields.gif)

## Works with arguments too!

This feature now also works with query arguments that accept input object types. When you place your cursor inside an empty argument object (e.g., `character: { }`), you can use the same keyboard shortcut (`Ctrl+Shift+Enter`) or select "Fill all fields" from the autocomplete menu to automatically fill in all the fields for that input type.

For example, given this query:
```graphql
{
  withGOTCharacter(character: { })
}
```

Placing the cursor inside the empty braces and pressing `Ctrl+Shift+Enter` will automatically fill in the required fields:
```graphql
{
  withGOTCharacter(character: {
    id: 
    book: {
      id: 
      url: 
      name: 
    }
  })
}
```

::: tip
You can still [generate whole queries and fragments](/docs/features/add-queries-and-fragments) directly from the docs along with their arguments filled in.
:::
