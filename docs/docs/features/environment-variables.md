---
parent: Features
---

## Environment Variables

Environment variables (URLs, authentication tokens, some other headers, etc) can be used to easily switch between various working environments (e.g. switching between local, staging and production environments).

![](https://miro.medium.com/max/5756/1*eCxSCJadudYfUYoPRpkSkA.png)

The environment variables can be defined in Environments (found in the top right corner in the header). An environment is simply a list of variables that can be used within the interface of the app. After an environment is created, you need to select it from the list of environments for it to be active.

After defining your environment variables, you can use them using the double curly braces syntax `{{env_var}}`. In the screenshot below, the swapi variable is used in the URL bar using `{{swapi}}`.

![altair](https://miro.medium.com/max/5760/1*4FkypN32B8E1K9mJHoKaWA.png)

Now you can easily test your GraphQL implementations across all your environments by just changing the environment you’re currently working with (instead of having to go to all the tabs to change the URLs and tokens 🤢).