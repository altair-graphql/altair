---
title: Getting Started
order: 0
---

# Test your GraphQL queries easily

Altair makes it very easy and delightful to test your GraphQL queries and server implementations, providing you with all the features you would need. [Download it here](/#download).

![Altair GraphQL](/assets/img/app-shot.png)

Altair (also _Altaïr_) is a free feature packed GraphQL IDE that helps you with things like running GraphQL queries, mutations and subscriptions, prettifying or minifying queries, uploading files with the [multipart specification](https://github.com/jaydenseric/graphql-multipart-request-spec), downloading queries and schemas, sxporting collections of queries, and [many more](/docs/features). It provides all that in a simple but powerful editor and an easy-to-use UI interface.

It is an indispensable tool in the tool belt of any GraphQL developer or team!

## Available Platforms

There are several options to choose from for you to use Altair, depending on your environment:

1. Desktop apps for [Mac, Windows and Linux](https://altairgraphql.dev/). You can get the latest version [here](https://altairgraphql.dev/#download).
1. [Chrome extension](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja) for [Google Chrome](https://www.google.com/chrome/) users.

1. [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/) for [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/) users.


For MacOS users, you can also install Altair using [cask](https://github.com/Homebrew/homebrew-cask):

```
$ brew install --cask altair-graphql-client
```

For linux users, you can also install Altair using [snap](https://snapcraft.io/altair):

```
$ snap install altair
```

For quick one-time usage or to see how it works, you can also use the [web app](https://altair-gql.sirmuel.design/): [https://altair-gql.sirmuel.design/](https://altair-gql.sirmuel.design/)

::: warning Note
It is **NOT** recommended to use the web app for full development, because there are some limitations there which might lead to frustrations if something isn't working as expected. It is preferred for you to use the desktop apps where possible, or the browser extensions for ease of use.
:::


## Usage with your application
You can easily integrate Altair with several application setups. Check the [available integrations](/docs/integrations).

You can also use Altair directly from a CDN e.g. https://unpkg.com/altair-static@latest/build/dist/. You can take a look at [this fiddle](https://jsfiddle.net/imolorhe/zrjh2x08/) for an example of how to integrate using the CDN.

Checkout the features available in Altair [here](/docs/features).

## How it's built
Altair GraphQL is built on modern web technologies using [Angular](https://angular.io/) - a JavaScript web framework, and written in [Typescript](https://www.typescriptlang.org/).

The desktop apps are built with [electron](https://www.electronjs.org), another awesome opensource project from the folks at [github](http://www.github.com/).

As a GraphQL IDE, it relies on [graphql.js](https://github.com/graphql/graphql-js) for several operations.

Altair is made to work with your existing workflow. You can run the desktop apps on MacOS (both on the intel and the Apple Silicon chips), on Windows and the various Linux distributions including [Ubuntu](https://ubuntu.com/), [Debian](https://www.debian.org/index.en.html), [Fedora](https://getfedora.org/en/), [CentOS](https://www.centos.org/), [OpenSUSE](https://www.opensuse.org/), etc.

The generated browser extensions are built to work on [Google Chrome](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja) and [Mozilla firefox](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/), but it can also work on [Microsoft Edge](https://www.microsoft.com/en-us/edge) and [Opera](https://www.opera.com/) browsers. The extensions allow you to debug your GraphQL development right in the browser environment you are already working in.
