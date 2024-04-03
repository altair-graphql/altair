---
title: Web App Limitations
---

# Altair GraphQL Web App Limitations

_TL;DR — It is recommended to use Altair desktop apps. If not, prefer browser extensions. Only use web app as a last resort._

If you’re reading this then very likely you are familiar with Altair GraphQL Client already, and have used it a couple of times.

Depending on how you were introduced to Altair, you either use it as a **desktop app**, **browser extension** for Chrome or Firefox, or you use _the web app_.

To get the best experience with using Altair, it is recommended to use the desktop apps available for your platform (Altair is available in macOS, windows and linux).

There are a number of limitations that could lead to a bad experience with using Altair as a web app, which I would try to specify in details here.

## CORS Policy

According to the definition in [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS),

> Cross-Origin Resource Sharing ([CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS)) is a mechanism that uses additional [HTTP](https://developer.mozilla.org/en-US/docs/Glossary/HTTP) headers to tell a browser to let a web application running at one origin (domain) have permission to access selected resources from a server at a different origin. A web application executes a **cross-origin HTTP request** when it requests a resource that has a different origin (domain, protocol, and port) than its own origin.

The “problem” with CORS in the web app usually arises when a GraphQL server has set up its CORS mechanism to the same-origin policy. Borrowing the explanation from MDN again,

> For security reasons, browsers restrict cross-origin HTTP requests initiated from within scripts. For example, `XMLHttpRequest` and the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) follow the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). This means that a web application using those APIs can only request HTTP resources from the same origin the application was loaded from, unless the response from the other origin includes the right CORS headers.

What this means is that the Altair web app wouldn’t be able to make the request to the server because it isn’t on the same domain as the server. For example, if the GraphQL endpoint is at http://example.com/graphql, the domain for the endpoint is `example.com` meanwhile the Altair web app’s domain is `altairgraphql.dev`. Obviously if you decide to set the CORS headers to allow any domain `*` or to allow the `altairgraphql.dev` domain, then it should work for you, but that requires an extra configuration on your GraphQL server which isn’t necessary, or efficient.

This CORS policy is less likely to be an issue using the desktop apps or browser extensions, unless you decide to use a more restrictive CORS header in which case there is still the option of adding the necessary `Origin` header, which would be discussed later in this article.

## Storage Limit

Another limitation for the web app is the size limit allowed for the local storage, which is [mostly around 10MB](https://www.html5rocks.com/en/tutorials/offline/quota-research/). I haven’t hit this limitation myself using the web app but the limitation is still there. With the desktop apps, this is not much of a problem as the limit is supposedly unlimited (at least verified to [store up to 50MB](https://github.com/electron/electron/pull/15596)). Using the desktop apps just releases you of any worries about hitting the storage limit.

Also there are deliberate limitations in the app for the web apps to make better use of the storage. You can only create up to **15** windows in the web apps as opposed to **50** in the desktop apps. Also your query history is limited to **7** in the web apps, as opposed to **50** in the desktop apps.

Since the browser extensions are also in the browser, they have the same storage limitations as the web apps.

## Request Headers

While Altair allows you to set headers for your GraphQL requests, there are limitations on the headers you can set. The [WHATWG spec](https://fetch.spec.whatwg.org/#terminology-headers) defines a list of [forbidden headers](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name) that cannot be modified programmatically since they are meant to be controlled by the user agent (the browser). This is for security reasons of course, and is a valid decision. However, when developing APIs, you have various security rules that need to be followed by any request made to your server, like the CORS policy discussed above. For this reason, you would want to modify some headers like the `Origin` and `Cookie` headers to achieve this.

This is possible with the desktop apps but not with the web apps and browser extensions.

## Working offline

The web app is hosted online and so needs to be accessed via the internet. This limits you from being able to work in the absence of an internet connection, whereas you are not limited by this when using the desktop apps or the browser extensions.

## Summary

Altair GraphQL Client has a lot of features and a lot of customisable options to suit your development needs, and there are several options to pick when developing. You should choose the right option based on your specific needs. This is just a recommendation and a disclaimer about the limitations to expect with using the web app.
