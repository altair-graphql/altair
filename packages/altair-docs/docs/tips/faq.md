---
parent: Tips
---

# Frequently Asked Questions (FAQ)

Find quick answers to the most commonly asked questions about Altair GraphQL Client.

## Getting Started

### Q: What's the difference between the web app, desktop app, and browser extension?

**A:** Each platform has different capabilities:

- **Desktop App** (Recommended): Full features, best performance, no CORS limitations. [Download here](https://altairgraphql.dev/#download)
- **Browser Extension**: Convenient in-browser access, good for quick testing. Available for [Chrome](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/)
- **Web App**: Quick access without installation, but has [limitations](/docs/learn/web-limitations) (CORS restrictions, limited file upload support). Try it at [web.altairgraphql.dev](https://web.altairgraphql.dev/)

### Q: Which version should I use?

**A:** For regular development work, use the **desktop app**. It provides the best experience with full features and no browser limitations. Use the browser extension for quick testing while browsing GraphQL documentation or APIs.

### Q: How do I connect to my GraphQL API?

**A:** 
1. Set your GraphQL endpoint URL in the URL field
2. Add any required authentication headers (usually `Authorization: Bearer YOUR_TOKEN`)
3. Click "Send Request" to test the connection
4. Click "Reload Schema" to load your API's schema for auto-completion

## Authentication & Security

### Q: How do I authenticate with my GraphQL API?

**A:** The most common authentication methods (see [Headers](/docs/features/headers) and [Authorization](/docs/features/auth) for more details):

1. **Bearer Token**: Add header `Authorization` with value `Bearer YOUR_TOKEN_HERE`
2. **API Key**: Add header `X-API-Key` with your API key value
3. **Basic Auth**: Add header `Authorization` with value `Basic base64(username:password)`
4. **Custom Headers**: Add any custom authentication headers your API requires

### Q: How do I handle token refresh automatically?

**A:** Use [pre-request scripts](/docs/features/prerequest-scripts) to automatically fetch refreshed tokens:

```javascript
// Pre-request script example
const refreshToken = altair.helpers.getEnvironment('refresh_token');

if (refreshToken) {
  // Make a request to refresh the token
  const response = await fetch('https://your-auth-server.com/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  const data = await response.json();
  
  // Store the new access token
  altair.helpers.setEnvironment('access_token', data.access_token);
}
```

Learn more about [pre-request scripts](/docs/features/prerequest-scripts) and [environment variables](/docs/features/environment-variables).

### Q: Is it safe to store API keys in Altair?

**A:** For development environments, yes. For production:
- Use environment variables with placeholder values
- Store actual tokens locally, not in shared collections
- Regularly rotate sensitive tokens
- Consider using temporary/limited-scope tokens for testing

## Features & Functionality

### Q: How do I save and organize my queries?

**A:** Use [Collections](/docs/features/collections):
1. Write your query
2. Click "Add to collection"
3. Choose existing collection or create new one
4. Access saved queries from the sidebar
5. Organize with folders and descriptive names

### Q: Can I use variables in my queries?

**A:** Yes! GraphQL variables make queries dynamic. Learn more about [variables](/docs/features/variables).

1. **In your query**:
```graphql
query GetUser($userId: ID!, $includeProfile: Boolean = false) {
  user(id: $userId) {
    id
    name
    profile @include(if: $includeProfile) {
      bio
    }
  }
}
```

2. **In the Variables pane** (click Variables button or use `Ctrl/Cmd+Shift+V`):
```json
{
  "userId": "123",
  "includeProfile": true
}
```

You can also use [environment variables](/docs/features/environment-variables) in the variables pane, though it's not recommended for complex scenarios.

### Q: How do I work with multiple environments (dev, staging, prod)?

**A:** Set up [environment variables](/docs/features/environment-variables):
1. Go to Settings → Environments
2. Create different environments (use snake_case naming):
```json
{
  "development": {
    "api_url": "https://dev-api.example.com/graphql",
    "auth_token": "dev_token_here"
  },
  "production": {
    "api_url": "https://api.example.com/graphql",
    "auth_token": "prod_token_here"
  }
}
```
3. Use variables in queries: `{{api_url}}`, `{{auth_token}}`
4. Switch environments from the dropdown

### Q: How do I upload files through GraphQL?

**A:** Use the [file upload feature](/docs/features/file-upload):
1. Your API must support the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec)
2. In your mutation, use a variable for the file:
```graphql
mutation UploadFile($file: Upload!) {
  uploadFile(file: $file) {
    id
    filename
  }
}
```
3. In Variables tab, click the file icon to select your file
4. See [File Upload documentation](/docs/features/file-upload) for details

## Troubleshooting

### Q: I'm getting CORS errors. How do I fix this?

**A:** CORS errors occur when using the web app:
- **Best solution**: Use the desktop app instead
- **Alternative**: Configure your GraphQL server to allow requests from `https://web.altairgraphql.dev`
- **For development**: Temporarily disable CORS on your server (not recommended for production)

### Q: My schema won't load. What's wrong?

**A:** Common causes and solutions:
1. **Authentication**: Ensure you have proper auth headers set before reloading schema
2. **Introspection disabled**: Some APIs disable introspection - contact your API provider
3. **Wrong endpoint**: Verify your GraphQL endpoint URL is correct
4. **Network issues**: Check if you can access the endpoint in a browser

### Q: Why are my queries slow?

**A:** Query performance tips:
1. **Request only needed fields**: Don't fetch unnecessary data
2. **Use pagination**: Limit large result sets
3. **Avoid deep nesting**: Keep query depth reasonable
4. **Check server performance**: The issue might be server-side
5. **Use query analysis**: Check response stats for timing information

### Q: I lost my queries/collections. Can I recover them?

**A:** Recovery options:
1. **Check backups**: Look for exported collection files
2. **Application data**: Check Altair's data directory:
   - Windows: `%APPDATA%\Altair GraphQL Client`
   - macOS: `~/Library/Application Support/Altair GraphQL Client`
   - Linux: `~/.config/Altair GraphQL Client`
3. **Cloud sync**: If enabled, data might be in your cloud account
4. **Team members**: Check if colleagues have shared collections

## Advanced Usage

### Q: Can I use Altair in my CI/CD pipeline?

**A:** Not directly, but you can:
1. Export queries from Altair for use in automated tests
2. Use generated queries in your testing framework
3. Consider using Altair for manual testing and other tools for automation

### Q: How do I write custom scripts?

**A:** Use pre-request and post-request scripts:

**Pre-request script** (runs before sending query):
```javascript
// Set environment variables dynamically
altair.helpers.setEnvironment('LAST_REQUEST_TIME', Date.now());

// Get environment variables
const apiUrl = altair.helpers.getEnvironment('API_URL');
```

**Post-request script** (runs after receiving response):
```javascript
// Access response data
console.log('Response time:', altair.response.responseTime);
console.log('Status code:', altair.response.statusCode);

// Process response
if (altair.response.body.errors) {
  console.error('Query errors:', altair.response.body.errors);
}
```

### Q: Can I extend Altair with plugins?

**A:** Yes! Altair supports plugins:
1. Browse available plugins in the plugin manager
2. Install plugins from npm or custom sources
3. Configure plugins in Settings → Plugins
4. See [Plugin documentation](/docs/plugins/) for more details

### Q: How do I share queries with my team?

**A:** Several options:
1. **Export collections**: Share collection files with team members
2. **Altair Cloud**: Use cloud sync for real-time sharing
3. **Version control**: Store exported queries in your project repository
4. **Documentation**: Copy queries to your API documentation

## Technical Questions

### Q: What GraphQL features does Altair support?

**A:** Altair supports:
- Queries, Mutations, and Subscriptions
- Variables and fragments
- Introspection and schema exploration
- File uploads (multipart spec)
- Custom headers and authentication
- WebSocket subscriptions
- Real-time subscriptions (SSE, WebSocket, etc.)

### Q: Which GraphQL servers work with Altair?

**A:** Altair works with any GraphQL server that follows the GraphQL specification, including:
- Apollo Server
- GraphQL Yoga
- Hasura
- AWS AppSync
- Prisma
- PostGraphile
- And many others

### Q: Can I use Altair offline?

**A:** The desktop app works offline for:
- Writing and editing queries
- Working with saved collections
- Using previously loaded schemas

You need internet connection for:
- Sending queries to remote APIs
- Loading/refreshing schemas
- Plugin downloads
- Cloud sync

### Q: Does Altair collect my data?

**A:** Altair respects your privacy:
- Local data stays on your device
- Cloud sync data is encrypted and only accessible to you
- We don't collect or analyze your queries or API data
- See our [Privacy Policy](/privacy) for full details

## Getting Help

### Q: Where can I get support?

**A:** Support options:
1. **Documentation**: Check our comprehensive [docs](/docs/)
2. **GitHub Issues**: [Report bugs or request features](https://github.com/altair-graphql/altair/issues)
3. **GitHub Discussions**: [Community support and questions](https://github.com/altair-graphql/altair/discussions)
4. **Search**: Use the search function in our docs

### Q: How do I report a bug?

**A:** To report bugs effectively:
1. Check if the issue already exists in [GitHub Issues](https://github.com/altair-graphql/altair/issues)
2. Provide clear steps to reproduce the problem
3. Include your Altair version and platform
4. Share relevant error messages or screenshots
5. Describe expected vs actual behavior

### Q: How can I contribute to Altair?

**A:** Ways to contribute:
1. **Report bugs**: Help us identify and fix issues
2. **Suggest features**: Share ideas for improvements
3. **Documentation**: Help improve guides and tutorials
4. **Code contributions**: Submit pull requests
5. **Community support**: Help other users in discussions

See our [Contributing Guide](/docs/contributing) for detailed information.

---

**Still have questions?** 

Check our [Troubleshooting Guide](/docs/tips/troubleshooting) for detailed problem-solving steps, or visit our [GitHub Discussions](https://github.com/altair-graphql/altair/discussions) to ask the community!