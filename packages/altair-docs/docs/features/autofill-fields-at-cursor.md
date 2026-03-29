---
parent: Features
---

# Autofill fields

You can easily and efficiently add all of the fields for a given type in the schema to your query. This can be especially useful when working with complex schemas that have many nested fields and types, and you want to include all of the available data in your query.

To do this, use the keyboard shortcut (`Ctrl+Shift+Enter`) or select "Fill all fields" from the autocomplete menu. This will cause Altair to automatically add all of the available fields for the type at the current cursor position to the query, without having to manually type out each field.

::: tip
Note: You can change the autocompletion depth limit using a [`addQueryDepthLimit`](/api/core/types/state/settings.interfaces/type-aliases/SettingsState#addquerydepthlimit) option in the settings.
:::

![Autofill fields](/assets/img/docs/autofill-fields.gif)

::: warning
Note: This only works for the query fields, and not for the arguments. You can still [generate whole queriea and fragments](/docs/features/add-queries-and-fragments) directly from the docs along with their arguments filled in.
:::
