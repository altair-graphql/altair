---
parent: Features
---

# Incremental delivery (@defer and @stream)

Altair supports the use of the [`@defer`](https://github.com/graphql/graphql-wg/blob/223447c39e76aedb9b7872170b3fcfd6f870e32c/rfcs/DeferStream.md#defer) and [`@stream`](https://github.com/graphql/graphql-wg/blob/223447c39e76aedb9b7872170b3fcfd6f870e32c/rfcs/DeferStream.md#stream) directives to enable incremental delivery of query results, following the specification defined [here](https://github.com/graphql/graphql-spec/pull/742). The specs are still in draft and are subject to change, but Altair aims to support the latest draft (and older drafts if possible).

::: warning
Note: This feature is only available from v7.2.0 and above.
:::

![Incremental delivery](/assets/img/docs/stream-defer-request.gif)

By default, Altair makes an educated guess on how to handle multiple responses from the server. Depending on the context and the type of response, it will either patch the responses together, display them separately or naively concatenate them into a single response. This is done to provide a seamless experience for the user, but it might not be the best way to handle the responses in all cases. If the default behavior is not what you want, you can change this behavior with the [`response.stream.strategy`](/api/core/types/state/settings.interfaces/type-aliases/SettingsState#response-stream-strategy) in the settings.
