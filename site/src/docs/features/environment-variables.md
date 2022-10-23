---
parent: Features
---

# Environment Variables

Environment variables (URLs, authentication tokens, some other headers, etc) can be used to easily switch between various working environments (e.g. switching between local, QA, staging and production environments).

![](https://miro.medium.com/max/5756/1*eCxSCJadudYfUYoPRpkSkA.png)

The environment variables can be defined in Environments (found in the top right corner in the header). An environment is simply a list of variables that can be used within the interface of the app. After an environment is created, you need to select it from the list of environments for it to be active.

After defining your environment variables, you can use them using the double curly braces syntax <code v-pre>{{env_var}}</code>. In the screenshot below, the swapi variable is used in the URL bar using <code v-pre>{{swapi}}</code>.

![altair](https://miro.medium.com/max/5760/1*4FkypN32B8E1K9mJHoKaWA.png)

You can also access nested environment variables using the object dot notation.

```json
{
  "meta": {
    "env": "staging"
  }
}
```

Given the environment payload above, you can use the `env` variable by using <code v-pre>{{meta.env}}</code>.

Now you can easily test your GraphQL implementations across all your environments by just changing the environment you’re currently working with (instead of having to go to all the tabs to change the URLs and tokens 🤢).

While you can create an environment, there is also the **Global environment** which doesn't need to be selected to be active. If an environment is selected, the environment is merged (shallow merge) with whatever is set in the Global environment. If no environment is selected, only the environment variables in the Global environment can be used.

### Where environment variables can be used

You can use environment variables basically everywhere in a window, but specifically in the following places:

- **URL** - This is probably where you would use the environment variables the most, to set the base URL of the GraphQL server.
- **Headers** - For example, you can set an `Authorization` header to <code v-pre>Bearer {{meta.env}}</code>.
- **Queries** - Of course this would show errors in the query since <code v-pre>{{meta.env}}</code> is not valid GraphQL syntax, but if you really need to use environment variables there, you can. _Broken syntax errors would **not** prevent Altair from sending the request to your server._
- **Variables** - The variables section is in the JSON format, so depending on where you put the environment variable, it would show syntax errors. If you put the environment variables in a string, you should not see errors. _Broken syntax errors would **not** prevent Altair from sending the request to your server._
- **Subscription URL** - Similar to the URL case, you can use environment variables here to set the base URL of the GraphQL server, or any other customization.
- **Subscription connection parameters** - Similar to the variables section, this is also in the JSON format but you can use the environment variables here as well.

### Escaping environment variable syntax

Environment variables are enabled pretty much everywhere in an Altair window. However you might have a use case where you actually want to use the double curly braces as-is without replacing it with an environment variable, or empty string. Altair allows you to escape the environment variable hydration by prefixing the opening curly brace with a backward slash `\`. So for example in the case of <code v-pre>Bearer {{meta.env}}</code>, you can pass that as-is in the request by replacing it with <code v-pre>Bearer \{{meta.env}}</code>. Altair would see that you are escaping the environment variable hydration and transform that to <code v-pre>Bearer {{meta.env}}</code> for you in the actual request.

### Special environment variables

**headers** - If you specify a `headers` payload in any of the environments (including Global environment), the headers you specify there would be set for all requests sent from all the tabs.

```json
{
  "headers": {
    "X-Api-Token": "12345"
  }
}
```

For example given the environment above, every request sent in Altair would have the `X-Api-Token` header set to `12345`.
