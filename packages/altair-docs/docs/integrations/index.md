---
title: Integrations
has_children: true
permalink: /docs/integrations
order: 3
---

# Integrations

There are a number of packages and integration methods that have been created to help you integrate Altair within your existing application or workflow.

## Server-Side Integrations

### Node.js Middleware

Integrate Altair directly into your Node.js GraphQL servers:

#### [Express Middleware](/docs/integrations/altair-express-middleware)
<Badge text="npm" type="danger"/>

Add Altair to your Express.js applications with minimal setup.

#### [Koa Middleware](/docs/integrations/altair-koa-middleware)
<Badge text="npm" type="danger"/>

Integrate Altair with Koa.js applications for GraphQL development.

#### [Static Rendering](/docs/integrations/altair-static)
<Badge text="npm" type="danger"/>

Render Altair as static HTML for any Node.js application or custom integration.

## Framework Integrations

### Modern Web Frameworks

#### [Next.js Integration](/docs/integrations/nextjs-integration)
Complete guide for integrating Altair into Next.js applications, including App Router and Pages Router support.

### Static Site Generators

#### [Gatsby Plugin](/docs/integrations/gatsby-plugin-altair-graphql)
<Badge text="npm" type="danger"/>

Official Gatsby plugin for adding Altair to your Gatsby sites during development.

## Custom Integrations

Using the packages above, you can create custom integrations for any platform or framework. Check out the individual integration guides for examples.

## CDN Usage

For quick integration without npm packages, you can use Altair directly from a CDN:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Altair</title>
    <base href="https://unpkg.com/altair-static@latest/build/dist/" />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link rel="stylesheet" href="styles.css" />
  </head>

  <body>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        AltairGraphQL.init();
      });
    </script>
    <app-root>
      <style>
        .loading-screen {
          /*Prevents the loading screen from showing until CSS is downloaded*/
          display: none;
        }
      </style>
      <div class="loading-screen styled">
        <div class="loading-screen-inner">
          <div class="loading-screen-logo-container">
            <img src="assets/img/logo_350.svg" alt="Altair" />
          </div>
          <div class="loading-screen-loading-indicator">
            <span class="loading-indicator-dot"></span>
            <span class="loading-indicator-dot"></span>
            <span class="loading-indicator-dot"></span>
          </div>
        </div>
      </div>
    </app-root>
    <script type="text/javascript" src="runtime.js"></script>
    <script type="text/javascript" src="polyfills.js"></script>
    <script type="text/javascript" src="main.js"></script>
  </body>
</html>
```

## Need Help?

Check out our [GitHub repository](https://github.com/altair-graphql/altair) for the latest integration examples and community contributions.
