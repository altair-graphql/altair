---
parent: Features
---

# Editor capabilities

Altair comes with several other little editor features to give you all the tools to work with GraphQL. These features can be accessed from the toolbox icon in the sidebar.

![docs menu](/assets/img/docs/other-tools-menu.png)


## In-context actions
Altair provides several in-context actions for easily accessing several available functionalities. This includes:

### Sending query
This action appears above each query, allowing you to easily select the query operation that is sent, even if you have multiple queries in your editor. Altair sends the entire document to the server and specifies the [`operationName`](https://graphql.org/learn/queries/#operation-name) for the current query.

### Selecting upload files (beta)
This action is available only in the new editor (still in beta). It appears inline when you have a variable with the [`Upload`](https://github.com/jaydenseric/graphql-upload) scalar type. It allows you to easily select the files you want to [upload](/docs/features/file-upload) without having to add it in the variable section manually.

## Go to docs
Quickly and easily view the docs for a field or type in your editor, by holding down the `Cmd` (in MacOS) or `Ctrl` (in Windows and Linux) and clicking it in the editor.

## Compress query

You can compress the query to a minified form, removing whitespaces and comments. You can use this after you have made a query and you want to use it in your client side application. This helps save as many bytes as possible when making network requests.

## Prettify (format/beautify) query

You can beautify the query in the editor in a properly indented manner for easier reading. This makes it easy to work with queries you might copy from one file to another,
which might have lost their indentation (or were never indented before).

## Convert to named query

Sometimes you want to get a named query so you can have multiple queries in the same window. This is just a convenient way to generate a name for your query so you don't have to.

## Refactor query

This functionality goes one step further from the [named query](#convert-to-named-query) conversion. It applies a number of transformations to the query. At the moment it does the following:

- transform query to a named query
- moves any arguments into query variables with the original varibles moved to the query variables section

## Copy as cURL

You can also easily copy your query as cURL. This is handy if you want to share the request with someone else or want to test the same request from the terminal.


## Clear

This just deletes all queries from the window (essentially this is: Select All -> Delete).
