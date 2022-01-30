---
parent: Features
---

# Editor capabilities

Altair comes with several other little editor features to give you all the tools to work with GraphQL. These features can be accessed from the toolbox icon in the sidebar.
## Compress query

You can compress the query to a minified form, removing any unnecessary whitespace
and comments. You can use this after you have made a query and you want to use it in your
client side application. This helps save as many bytes as possible when making network requests.

## Format query

You can format the query in the editor in a properly indented manner for easier reading.
This makes it easy to work with queries you might copy from one file to another,
which might have lost their indentation (or were never indented before).

## Convert to named query

Sometimes you want to get a named query so you can have multiple queries in the same window. This is just a convenient way to generate a random name for your query for you.

## Refactor query

This functionality attempts to go one step further from the named query conversion. It aims to apply a number of refactoring to the query. At the moment it does the following:

- transform query to a named query
- moves any arguments into query variables with the original varibles moved to the query variables section

## Copy as cURL

You can also easily copy your query as cURL. This is handy if you want to share the request with someone else or want to test the same request from the terminal.


## Clear

This just deletes all queries from the window (essentially this is: Select All -> Delete).
