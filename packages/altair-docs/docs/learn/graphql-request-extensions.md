---
title: GraphQL Request Extensions
---

# Exploring GraphQL Request Extensions

[GraphQL request extensions](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#json-encoding) are a way to add additional metadata or functionality to your GraphQL requests. They allow you to include extra information in your requests that can be used by the server to customize the response or perform additional actions.

Extensions are typically included in the `extensions` field of a GraphQL request. This field can contain any JSON-serializable data, making it highly flexible.

## How do GraphQL request extensions work?

When you send a GraphQL request, you can include an `extensions` field in the request object. This field can contain any key-value pairs you want to include. The server can then read these extensions and use them to modify the response or perform additional actions.

Here's an example of a GraphQL request with extensions:

```json
{
  "query": "query { user(id: 1) { name, email } }",
  "extensions": {
    "trace": true,
    "customField": "customValue"
  }
}
```

In this example, the `extensions` field includes a `trace` field set to `true` and a `customField` with a value of `"customValue"`. The server can use these extensions to enable tracing for the request or perform some custom logic based on the customField. The server can then include additional information in the response based on these extensions or perform some side effects.

In Altair GraphQL, you can add extensions to your requests using the "Request Extensions" menu item in the sidebar.

![Altair GraphQL Request Extensions menu](/assets/img/docs/request-extensions-menu.png)

This allows you to customize your requests and add additional metadata to them. The extensions data must be in JSON format.

![Altair GraphQL Request Extensions dialog](/assets/img/docs/request-extensions-dialog.png)

## Some practical use cases for GraphQL request extensions

Let's explore some real-world scenarios where GraphQL request extensions can significantly enhance your API functionality.

### Tracing and debugging

One common use case for GraphQL request extensions is tracing and debugging. By including a `trace` field in the `extensions` object, you can instruct the server to include detailed tracing information in the response.

```json
{
  "query": "query { user(id: 1) { name, email } }",
  "extensions": {
    "trace": true
  }
}
```

This can be useful for debugging performance issues, understanding how the server processes your requests, or dentifying bottlenecks in your GraphQL resolvers. Many GraphQL servers and tools support tracing out of the box.

### Custom logic and business rules

Extensions can also be used to include custom logic or business rules in your requests. This allows for greater flexibility in how your API behaves without changing the core GraphQL schema. For example, you might include a `priority` field in the `extensions` object to indicate the priority of the request.

```json
{
  "query": "mutation { createOrder(items: [...]) { id, status } }",
  "extensions": {
    "priority": "high"
  }
}
```

The server can then use this information to prioritize the processing of high-priority requests, apply different business logic based on the priority, or route requests to different processing queues.

### Authentication and authorization

While GraphQL typically handles authentication through HTTP headers, extensions can be used instead to include the authentication or authorization information in your requests.

```json
{
  "query": "query { sensitiveData { ... } }",
  "extensions": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "permissions": ["READ_SENSITIVE_DATA"]
  }
}
```

This approach can be useful for implementing fine-grained access control, providing context-specific authentication, or supporting multiple authentication methods.

::: warning Note
It's important to note that while extensions can be used for authentication, they should not replace secure transport mechanisms like HTTPS. The [GraphQL Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html) provides more information on best practices for GraphQL security.
:::

### Pagination and filtering

Extensions can be particularly useful for implementing advanced pagination and filtering mechanisms, especially when you want to keep your GraphQL schema clean and simple.

```json
{
  "query": "query { users { id, name } }",
  "extensions": {
    "pagination": {
      "page": 2,
      "limit": 20
    },
    "filter": {
      "role": "admin",
      "active": true
    }
  }
}
```

This approach allows for flexible pagination without cluttering the schema, complex filtering options, and easy implementation of cursor-based pagination. The [GraphQL Cursor Connections](https://relay.dev/graphql/connections.htm) Specification provides more insights into implementing robust pagination in GraphQL.

### Caching strategies

Extensions can be used to implement custom caching strategies, allowing clients to specify how they want the data to be cached.

```json
{
  "query": "query { latestNews { title, content } }",
  "extensions": {
    "cache": {
      "ttl": 300,
      "scope": "public"
    }
  }
}
```

This can be useful for implementing client-specific caching policies, optimizing performance for different types of data, or managing cache invalidation strategies.

## Implementing GraphQL request extensions

To implement GraphQL request extensions on the server side, your GraphQL server must be able to read and process the `extensions` field in the request object. Most GraphQL server libraries provide built-in support for extensions, allowing you to access the extensions data in your resolvers or middleware. Here's a basic example accessing the `extensions` in the [context](https://the-guild.dev/graphql/yoga-server/docs/features/context) using GraphQL yoga:

```javascript
import { createServer } from 'http';
import { createSchema, createYoga } from 'graphql-yoga';

const typeDefs = /* GraphQL */ `
  type Query {
    logHeader: Boolean
  }
`;

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        logHeader(_, _args, context) {
          const extensions = context.params.extensions;
          // Use the extensions to modify the query behavior
        },
      },
    },
  }),
});

const server = createServer(yoga);
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql');
});
```

## Best practices and considerations

When using GraphQL request extensions, it's essential to follow best practices to ensure your API remains secure, maintainable, and performant. Here are some key considerations to keep in mind:

### Security

If you include sensitive information in your extensions, be cautious about exposing this data in error messages or logs. Ensure that you validate and sanitize the extensions data to prevent security vulnerabilities.

### Performance

Use cases for extension can impact performance if not used judiciously. Monitor their impact on your API's response times and consider caching or optimizing expensive operations.

### Versioning

Since extensions contain arbitrary data and are not part of your GraphQL schema, consider how new changes can affect existing clients. Use new fields in the `extensions` object to introduce new features without breaking backward compatibility. If you need to make breaking changes, consider a new versioned field, e.g. `tracingV2`.

### Documentation

Clearly document your supported extensions and their behaviors for API consumers. Provide examples and guidelines on how to use extensions effectively and what to expect in the response.

## Conclusion

GraphQL request extensions offer a powerful way to enhance your API's functionality without compromising the simplicity and elegance of your GraphQL schema. From debugging and custom business logic to advanced authentication and caching strategies, extensions provide a flexible mechanism for tailoring your API to specific needs.

By leveraging GraphQL request extensions, you can build more robust, efficient, and customizable APIs that can adapt to a wide range of use cases and client requirements. As you continue to explore the possibilities of GraphQL, remember that Altair GraphQL is a valuable tool in your toolkit for experimenting with request extensions and other advanced GraphQL features.
