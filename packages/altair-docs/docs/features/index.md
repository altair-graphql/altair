---
title: Overview
has_children: true
permalink: /docs/features
order: 2
---

# Features

Altair GraphQL Client is chuck full of features that make it a great tool for working with your GraphQL APIs. The features &mdash; ranging from simple query formatting to sharing and collaborating with your colleagues &mdash; are designed to make your workflow easier and more efficient.

## Overview

Here's a quick summary of 30 features you have available in Altair. You can find more details about each feature in the linked pages.

![Altair GraphQL features overview](/assets/img/altair-features-overview.png)

### 1. Window management

Are you working on multiple queries across multiple projects at the same time? Altair allows you to manage your queries in [different windows](/docs/features/multiple-windows), making it easy to switch between them without missing a beat!

### 2. Environments

Quickly switch between different [environments](/docs/features/environment-variables) to test your queries across different setups. You can define environment variables and use them all around the app (endpoints, headers, queries, etc) to make your workflow more efficient.

### 3. Settings

Customize Altair to your liking with the [settings](/docs/features/settings-pane) options available. You can change the [theme](/docs/features/theme-customization), font size, language, manage plugins, etc to make your experience more comfortable.

### 4. HTTP verbs

Altair supports all the [HTTP verbs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) you would need to interact with your GraphQL server. You can easily switch between them to test your queries.

### 5. GraphQL endpoint

Altair allows you to set your GraphQL endpoint and start testing your queries right away. You can also use environment variables in the endpoint for a more dynamic workflow.

### 6. Saving queries to collections

Save your queries to [collections](/docs/features/collections) for easy access and sharing with your team. You can also export and import collections to collaborate with your colleagues.

### 7. Downloading queries

Download ([export](/docs/features/import-export-queries)) your queries in a file to share with your team or to keep a backup of your queries. You can also import queries from a file to start working on them.

### 8. Reloading schema

While working on your GraphQL server, you will often need to reload the schema to get the latest changes. Altair allows you to reload the schema easily, which is used to power the [docs](/docs/features/documentation). You can also setup your server to [auto refresh](/docs/features/schema-auto-refresh) the schema when it changes.

### 9. Documentation

One of the main benefits of a GraphQL Client like Altair is the ability to browse through the docs for your GraphQL API easily and instantly. Altair provides you with a [documentation explorer](/docs/features/documentation) to help you understand the schema of your GraphQL server. You can easily navigate through the schema to find the types, queries, mutations, and subscriptions available.

### 10. Sending query requests

After setting up and drafting your query, Altair allows you to send the query to your server and view the response. Depending on the number of queries in your window, the send button allows you select the query you want to send, and also allows you to send multiple queries at once with [request batching](https://github.com/graphql/graphql-over-http/blob/main/rfcs/Batching.md).

### 11. Custom request headers

You can set [custom headers](/docs/features/headers) for your requests in Altair. This is useful for setting headers like `Authorization`, `Content-Type`, etc. You can also use environment variables in the headers for a more dynamic workflow.

### 12. GraphQL subscriptions

Altair supports [GraphQL subscriptions](/docs/features/graphql-subscriptions) with many commonly used implementations (e.g. websocket, SSE, AppSync, etc) out of the box. You can easily set up your subscription URL and start listening to events from your server.

### 13. Query history

Altair keeps a [history](/docs/features/query-history) of your queries, making it easy to access and reuse them. You can also clear the history if you want to start afresh.

### 14. Other utilities

Altair provides you with other [utilities](/docs/features/editor-capabilities) (like prettifying, minifying, refactoring, etc) to help you work more efficiently.

### 15. Collections

You can save your queries to [collections](/docs/features/collections) for easy access and sharing with your team. You can also export and import collections to collaborate with your colleagues.

### 16. User account

Altair allows you to create a user account to save your queries and settings to the cloud. This allows you to access your queries and settings from any device and also share your queries with your team, while keeping them in sync.

### 17. Query pane

This is where you write your queries. This is a powerful editor that provides you with syntax highlighting, auto-completion, and other features to help you write your queries faster.

### 18. Pre-request scripts

You can write [pre-request scripts](/docs/features/prerequest-scripts) to run before sending your query to the server. This is useful for setting up your query, setting headers, etc before sending the query.

### 19. Post-request scripts

You can write [post-request scripts](/docs/features/prerequest-scripts) to run after sending your query to the server. This is useful for processing the response, logging, etc.

### 20. Authorization

Altair allows you to set up [authorization](/docs/features/auth) for your queries. You can set up different types of authorization (e.g. Bearer token, Basic Auth, etc) and use environment variables for a more dynamic workflow.

### 21. Result pane

This is where you view the response from your server in JSON format. You can also view basic information about the response (e.g. status code, response time, etc) in the result pane.

### 22. Response headers

You can view the response headers from your server in Altair. This is useful for debugging and understanding the response from your server.

### 23. In-context actions

Altair provides quick [accessible actions](/docs/features/editor-capabilities#in-context-actions) in the editor to help you work more efficiently. These actions appear whenever they can be used (e.g. when you have a query selected, when you have a query in the editor, etc).

### 24. Query variables

You can set [variables](/docs/features/variables) for your queries in Altair. This is useful for setting dynamic values for your queries (e.g. user ID, page number, etc).

### 25. File uploads

Altair supports [file uploads](/docs/features/file-upload) with the [multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec). This specifies the files as variables in the query following the specification.

### 26. Response stats

Altair provides you with response stats to help you understand the response from your server. This includes information like response time, status code, etc.

### 27. Clearing the response

You can clear the response from the result pane in Altair. This is useful when you want to have a blank state to avoid confusions with subsequent responses.

### 28. Downloading the response

You can download the response from your server in Altair. This is useful when you want to save the response for later use or for sharing with your team.

### 29. Searching the docs

You can search the docs in Altair to quickly find the type, query, mutation, or subscription you are looking for. Imagine working with a GraphQL API server with a large schema! It would be a nightmare to navigate through the schema without a search feature.

### 30. Sorting in the docs

You can sort the fields in the docs in Altair to help you navigate through the schema more easily.

## Any missing feature?

Are we missing any feature that you think Altair should have or that isn't documented? Let us know by [creating an issue on GitHub](https://github.com/altair-graphql/altair/issues/new?labels=&template=Feature_request.md).

PRs are also welcome!
