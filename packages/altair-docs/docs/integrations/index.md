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

#### [React Integration](/docs/integrations/react-integration)
Learn how to embed Altair in React applications for development and testing workflows.

### Static Site Generators

#### [Gatsby Plugin](/docs/integrations/gatsby-plugin-altair-graphql)
<Badge text="npm" type="danger"/>

Official Gatsby plugin for adding Altair to your Gatsby sites during development.

## Custom Integrations

### Build Your Own Integration

Using the packages above, you can create custom integrations for any platform or framework:

- **Django**: Use `altair-static` to render Altair in Django views
- **Ruby on Rails**: Integrate Altair into Rails applications
- **PHP**: Add Altair to Laravel, Symfony, or custom PHP applications
- **Python**: Flask, FastAPI, and other Python web frameworks
- **Java**: Spring Boot and other Java web applications
- **.NET**: ASP.NET Core and other .NET web applications

### Integration Patterns

**Development-Only Integration**:
```javascript
if (process.env.NODE_ENV === 'development') {
  // Only serve Altair in development
  app.use('/graphql-dev', altairExpress({
    endpointURL: '/graphql'
  }));
}
```

**Environment-Specific Configuration**:
```javascript
const altairConfig = {
  endpointURL: process.env.GRAPHQL_ENDPOINT,
  subscriptionsEndpoint: process.env.GRAPHQL_WS_ENDPOINT,
  initialQuery: process.env.NODE_ENV === 'development' 
    ? '{ __schema { types { name } } }'
    : undefined
};
```

**Authentication Integration**:
```javascript
app.use('/altair', (req, res, next) => {
  // Add authentication check
  if (!req.user || !req.user.isDeveloper) {
    return res.status(403).send('Access denied');
  }
  next();
}, altairExpress(config));
```

## CDN Usage

For quick integration without npm packages, you can use Altair directly from a CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <title>GraphQL Playground</title>
</head>
<body>
  <div id="altair"></div>
  <script src="https://unpkg.com/altair-static@latest/build/dist/altair.min.js"></script>
  <script>
    AltairGraphQL.render({
      endpointURL: '/graphql',
      subscriptionsEndpoint: 'ws://localhost:4000/graphql'
    }, document.getElementById('altair'));
  </script>
</body>
</html>
```

## Production Considerations

### Security Best Practices

- **Environment Restrictions**: Only enable Altair in development/staging environments
- **Authentication**: Implement proper authentication for production access
- **IP Whitelisting**: Restrict access to specific IP addresses when needed
- **HTTPS**: Always use HTTPS in production environments

### Performance Optimization

- **Conditional Loading**: Only load Altair when needed
- **Caching**: Implement appropriate caching strategies
- **CDN**: Use CDN for static assets when possible
- **Minification**: Ensure assets are properly minified

### Monitoring and Logging

- **Access Logs**: Log access to Altair interfaces
- **Error Tracking**: Monitor for integration errors
- **Performance Metrics**: Track loading times and usage patterns
- **Security Monitoring**: Watch for unauthorized access attempts

## Community Integrations

The community has created additional integrations:

- **Docker**: Pre-built Docker images with Altair
- **Kubernetes**: Helm charts for Kubernetes deployments
- **CI/CD**: Integration with testing pipelines
- **IDE Extensions**: Extensions for various code editors

## Need Help?

- **Documentation Issues**: Report problems with integration docs
- **Feature Requests**: Suggest new integration possibilities
- **Community Support**: Ask questions in GitHub Discussions
- **Contributing**: Help improve existing integrations

Check out our [GitHub repository](https://github.com/altair-graphql/altair) for the latest integration examples and community contributions.
