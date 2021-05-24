---
parent: Features
---

# GraphQL Subscriptions (with desktop notifications)

You can test your GraphQL subscriptions easily and also get a notification when you are away from the
app (desktop apps only). This is very handy when developing apps that use the realtime feature of
GraphQL, like chatting ang gaming applications that need realtime feedback.

Altair supports a number of subscription implementations:

### Websocket

This supports both the the original [subscriptions-transport-ws protocol](https://github.com/apollographql/subscriptions-transport-ws/blob/master/PROTOCOL.md) as well as the new [graphql-ws protocol](https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md), which are the more common specifications used for GraphQL subscriptions.

### AWS AppSync

This supports the MQTT-based subscription protocol used in [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html) which is an enterprise-level, fully managed GraphQL service with real-time data synchronization and offline programming features.

The connection parameters are in JSON format as following

    {
      "aws_project_region": "<AWS_REGION>", //AWS Region abbreviation
      "aws_appsync_graphqlEndpoint": "https://******", //The value you can copy from AWS AppSync Endpoint, please use the HTTPS value
      "aws_appsync_region": "<AWS_REGION>", //AWS Region abbreviation
      "aws_appsync_authenticationType": "<AWS_APPYSYNC_Authentication_TYPE>", //API_KEY, OPENID_CONNECT or AMAZON_COGNITO_USER_POOLS (IAM is not supported)
      "aws_appsync_apiKey": "*******", //API Key, required if authentication type = API_KEY,
      "aws_appsync_jwtToken": "******", //JWT Token, required if authentication type = OPENID_CONNECT or AMAZON_COGNITO_USER_POOLS
    }

![Specifying connection parameters](https://user-images.githubusercontent.com/15103463/99538456-49d97080-29ad-11eb-9002-e744eec42780.png)

![AWS AppSync subscription](https://i.imgur.com/pDhCiBn.png)

### Rails Action Cable

[Action Cable](https://guides.rubyonrails.org/action_cable_overview.html) seamlessly integrates WebSockets with the rest of your Rails application. It allows for real-time features to be written in Ruby in the same style and form as the rest of your Rails application, while still being performant and scalable.

![Specifing action cable connection parameters](https://user-images.githubusercontent.com/3378171/99864870-e8afc980-2b73-11eb-8eb1-ff1334c4dc21.png)

![Action cable subscription](https://user-images.githubusercontent.com/3378171/99864871-ea798d00-2b73-11eb-835b-69fa6ae0726e.png)
