---
parent: Features
---

# Environment Variables

Environment variables (URLs, authentication tokens, some other headers, etc) can be used to easily switch between various working environments (e.g. switching between local, staging and production environments).

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
