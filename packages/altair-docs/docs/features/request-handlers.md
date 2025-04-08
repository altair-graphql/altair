---
parent: Features
---

# Request handlers

Altair comes with several request handlers to support different GraphQL server implementation protocols. By default the HTTP request handler is used for queries and mutations while the WebSocket request handler is used for subscriptions. This aligns with the historic defaults applied in Altair as well as the most common server implementations.

![access request handlers from the side menu](/assets/img/docs/request-handlers-sidemenu.png)

::: tip
In older versions of Altair, this was used just for configuring the subscription implementation to use. This has been replaced with request handlers in v7.2.0 which is a more general feature that allows you to choose the request handler to use for your queries, mutations and subscriptions. All the subscription implementations below are still available as request handlers but are no longer limited to subscriptions only.
:::

![request handlers dialog](/assets/img/docs/request-handlers-dialog.png)

## HTTP request handler

The HTTP requeest handler sends requests using the HTTP protocol and closely follows the [GraphQL over HTTP](https://graphql.github.io/graphql-over-http/draft/) specification (there are few deviations from the current draft since we want to maintain the behavior of Altair across versions &mdash; this might change in a future major version). This is the most common way to send queries and mutations to a GraphQL server. It also supports sending queries with variables and file uploads following the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec).

## WebSocket request handler

The WebSocket request handler sends requests using the WebSocket protocol using the graphql-ws protocol which is the newer [GraphQL over websocket](https://github.com/graphql/graphql-over-http/blob/d80afd45782b40a9a8447fcff3d772689d83df56/rfcs/GraphQLOverWebSocket.md) protocol. This is the most common way to send subscriptions to a GraphQL server.

**Note: There is also a handler for the older [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws/blob/master/PROTOCOL.md) protocol, but it is not recommended to use this as it is deprecated and has been replaced by the graphql-ws protocol.**

## SSE request handler

The Server-Sent Events (SSE) request handler sends requests using the HTTP protocol via [server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html) follows the [GraphQL over SSE](https://github.com/graphql/graphql-over-http/blob/d80afd45782b40a9a8447fcff3d772689d83df56/rfcs/GraphQLOverSSE.md) specification via [graphql-sse](https://github.com/enisdenjo/graphql-sse). This is an alternative protocol typically used for subscriptions (although it can be used for any GraphQL request). It is not as common as the WebSocket request handler but is still supported in Altair.

## AWS AppSync request handler

The AWS AppSync request handler sends requests using the MQTT protocol via the [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html) subscription protocol. This is an enterprise-level, fully managed GraphQL service with real-time data synchronization and offline programming features. The connection parameters are in JSON format as following:

```json
{
  "aws_project_region": "<AWS_REGION>", //AWS Region abbreviation
  "aws_appsync_graphqlEndpoint": "https://******", //The value you can copy from AWS AppSync Endpoint, please use the HTTPS value
  "aws_appsync_region": "<AWS_REGION>", //AWS Region abbreviation
  "aws_appsync_authenticationType": "<AWS_APPYSYNC_Authentication_TYPE>", //API_KEY, OPENID_CONNECT, AMAZON_COGNITO_USER_POOLS or AWS_LAMBDA (IAM is not supported)
  "aws_appsync_apiKey": "*******", //API Key, required if authentication type = API_KEY,
  "aws_appsync_jwtToken": "******", //JWT Token, required if authentication type = OPENID_CONNECT or AMAZON_COGNITO_USER_POOLS
  "aws_appsync_token": "******" //Token passed to Lambda authorizer, required if authentication type = AWS_LAMBDA
}
```

## Rails Action Cable request handler

The Rails Action Cable request handler sends requests using the WebSocket protocol via the [Action Cable](https://guides.rubyonrails.org/action_cable_overview.html) protocol. This is a protocol used in Ruby on Rails applications to provide real-time features in the same style and form as the rest of your Rails application, while still being performant and scalable. The connection parameters are in JSON format as following:

```json
{
  "channel": "<CHANNEL_NAME>" //The channel name to subscribe to
}
```
