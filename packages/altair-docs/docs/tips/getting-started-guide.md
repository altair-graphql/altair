---
parent: Tips
---

# Getting Started Guide

New to Altair? This step-by-step guide will help you get up and running quickly and effectively.

## Step 1: Installation

Choose the installation method that works best for your setup:

### Desktop App (Recommended)
- **Windows/Mac/Linux**: Download from [altairgraphql.dev](https://altairgraphql.dev/#download)
- **macOS with Homebrew**: `brew install --cask altair-graphql-client`
- **Linux with Snap**: `snap install altair`

### Browser Extensions
- **Chrome**: Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja)
- **Firefox**: Install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/)

### Web App (Limited Use)
- Access at [web.altairgraphql.dev](https://web.altairgraphql.dev/) for quick testing
- ⚠️ **Note**: Web app has limitations - use desktop/extension for full features

## Step 2: Your First Query

Let's connect to a GraphQL API and run your first query:

### Using a Public API
We'll use the GitHub GraphQL API as an example:

1. **Set the endpoint**: `https://api.github.com/graphql`
2. **Add authorization header**:
   - Click the headers tab
   - Add header: `Authorization`
   - Value: `Bearer YOUR_GITHUB_TOKEN`
   - [Get a GitHub token here](https://github.com/settings/tokens)

3. **Write your first query**:
```graphql
query {
  viewer {
    login
    name
    bio
    company
  }
}
```

4. **Send the query**: Click the "Send Request" button (▶️)

### Using a Local Development Server
If you have a local GraphQL server:

1. **Set the endpoint**: `http://localhost:4000/graphql` (adjust port as needed)
2. **Write a query** based on your schema
3. **Send the request**

## Step 3: Explore the Schema

One of Altair's most powerful features is schema exploration:

1. **Load the schema**: Click the reload docs button in the action bar (or use `Ctrl+Shift+R`)
2. **Browse documentation**: Click the docs button to toggle the documentation pane (or use `Ctrl+Shift+D`)
3. **Use autocomplete**: Start typing in the query editor - Altair will suggest fields and arguments

## Step 4: Essential Features to Try

### Environment Variables
Set up different environments (dev, staging, prod):

1. Go to **Settings** → **Environment variables**
2. Create environments like:
   ```json
   {
     "dev": {
       "API_URL": "http://localhost:4000/graphql",
       "AUTH_TOKEN": "dev_token_here"
     },
     "prod": {
       "API_URL": "https://api.example.com/graphql",
       "AUTH_TOKEN": "prod_token_here"
     }
   }
   ```
3. Use variables in your endpoint: `{{API_URL}}`
4. Use in headers: `Authorization: Bearer {{AUTH_TOKEN}}`

### Query Variables
For dynamic queries:

1. **In the query**:
```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}
```

2. **In the Variables panel**:
```json
{
  "userId": "123"
}
```

### Collections
Save frequently used queries:

1. Write your query
2. Click "Add to collection"
3. Choose or create a collection
4. Access saved queries from the sidebar

## Step 5: Advanced Tips

### Pre-request Scripts
Automate authentication or data preparation:

```javascript
// Set dynamic headers
altair.helpers.setHeader('X-Request-ID', Date.now().toString());

// Set variables based on conditions
if (altair.data.environment.name === 'prod') {
  altair.helpers.setEnvironment('timeout', 30000);
}
```

### Custom Themes
Personalize your workspace:

1. Go to **Settings** → **Theme**
2. Choose from built-in themes or create custom CSS
3. Adjust syntax highlighting, font size, and colors

### Keyboard Shortcuts
Speed up your workflow:

- `Ctrl/Cmd + Enter`: Send request
- `Ctrl + Shift + P`: Prettify query
- `Ctrl/Cmd + /`: Toggle comments
- `Ctrl + D`: Jump to docs
- `Ctrl + Shift + V`: Toggle variables
- `Ctrl + Shift + H`: Toggle headers

## Common First-Time Issues

### CORS Errors
If using the web app with local APIs:
- Use the desktop app instead
- Or configure your server to allow CORS from `https://web.altairgraphql.dev`

### Authentication Issues
- Double-check token format (often needs `Bearer ` prefix)
- Ensure token has required permissions
- Check if token is expired

### Schema Not Loading
- Verify endpoint URL is correct
- Check if introspection is enabled on the server
- Ensure proper authentication headers are set

## Next Steps

Now that you're set up:

1. **Explore [Features](/docs/features/)**: Learn about advanced capabilities
2. **Check [Tips](/docs/tips/)**: Discover workflow improvements
3. **Try [Plugins](/docs/plugins/)**: Extend functionality
4. **Join the Community**: [GitHub Discussions](https://github.com/altair-graphql/altair/discussions)

Happy GraphQL querying! 🚀