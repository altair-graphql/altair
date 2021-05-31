---
parent: Integrations
---

# altair-static

<Badge text="npm" type="error"/>

[altair-static](https://www.npmjs.com/package/altair-static) renders Altair for you as a string with all the options you pass to it, as well as providing you with all the assets (JS, CSS, images, etc) used by the Altair app, giving you the ability to use Altair in any NodeJS project.


#### Installation

This is a node module and can be installed using npm:

```
npm install --save altair-static
```

Alternatively, if you are using [`yarn`](https://yarnpkg.com/):

```
yarn add altair-static
```

#### Usage

```ts
import { getDistDirectory, renderAltair, RenderOptions } from 'altair-static';
import { ROUTE_ALTAIR, ROUTE_PATH_GRAPHQL, ROUTE_PATH_GRAPHQL_SUBSCRIPTIONS } from '../config';

const renderOptions: RenderOptions = {
  baseURL: ROUTE_ALTAIR,
  endpointURL: ROUTE_PATH_GRAPHQL,
  subscriptionsEndpoint: ROUTE_PATH_GRAPHQL_SUBSCRIPTIONS,
  initialQuery: `{ getData { id name surname } }`,
};
const altairAsString = renderAltair(renderOptions);
const altairAssetsPath = getDistDirectory();

// ... the rest of your code ...
```

Now you can render Altair how you want.
