---
parent: Features
---

# Variables and Fragments

You can define and use [GraphQL variables](https://graphql.org/learn/queries/#variables) in your queries, and then specify the values for the variables when you execute the query. This allows you to easily and efficiently reuse common values in your queries, and quickly change the values of the variables as you test and debug your queries.

You can enter the variables content as JSON in the "Variables" section of the editor.

Once you have defined your variables, you can use them in your query by referencing the variable name in the query, and prefixing the name with a dollar sign ($). For example, you might write a query like this:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}
```