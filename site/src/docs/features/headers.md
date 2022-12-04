---
parent: Features
---

# Custom request headers

Altair provides flexibility by allowing you to set custom request headers, such as authentication tokens.

![header dialog](https://i.imgur.com/dCwAsl4.png)

When you send a query using Altair, the headers will be included in the request. This allows you to easily specify and manage the headers for your GraphQL requests.

You can also set global headers via the [global environment](./environment-variables). Just add a `headers` payload with your global headers there and these headers would be applied to all the windows.
![global environment](https://i.imgur.com/uG98IHg.png)
