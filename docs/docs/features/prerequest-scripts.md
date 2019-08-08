---
parent: Features
---

## Pre request scripts

Ever wanted to use dynamic data in your request headers, URLs, before sending the request? Pre request scripts enables you do that. With pre request scripts, you can set environment variables from your cookies or create any combination of values for your environment variables. This comes in handy for environments where things like CSRF tokens are used to verify the requests sent to the server.

### Available API for Pre request scripts

Pre request scripts support all JavaScript syntax supported in the latest [ecmascript 2019 (ES10) specification](https://tc39.es/ecma262/) (except **with** and **label** statements, but those are discouraged anyway). These include things like `[].flat()`, `[].flatMap()`, `Object.fromEntries()`, etc.

There is also a global object `altair` available within the context of the pre request script containing helper methods for interacting with altair.

#### altair.data

This contains data used to process your GraphQL request.

**altair.data.headers** - The headers sent as part of your request.

**altair.data.variables** - The parsed variables object sent as part of your request.

**altair.data.query** - The GraphQL query sent to the server.

**altair.data.environment** - The formatted environment object containing the serialized set of environment data before your request is sent.

#### altair.helpers

This contains a number of helper methods for carrying out basic tasks, like interacting with altair, making network requests, etc.

**altair.helpers.getEnvironment(key: string)** - Returns the environment variable for the specified key.

```js
altair.helpers.getEnvironment('api_key')
```

**altair.helpers.setEnvironment(key: string, val: any)** - Sets the environment variable for the specified key, overriding the environment variable for the current request.

```js
altair.helpers.setEnvironment('api_key', 'a482djksd289xxxxxxxxx');
```

**altair.helpers.getCookie(key: string)** - Retrieves a value stored in browser cookie.

```js
const sessid = altair.helpers.getCookie('sessid');
```

**altair.helpers.request(...args)** - _[Returns a promise]_ Makes a HTTP request using the provided options. This helper simply passes on the arguments to the [HttpClient](https://angular.io/guide/http#httpclient) in angular. To know all the possible options, checkout the [Angular HttpClient API documentation](https://angular.io/api/common/http/HttpClient#request).

```js
const res = await altair.helpers.request('GET', 'https://api.agify.io/?name=michael');
// res => {"name":"michael","age":60,"count":41938}
```