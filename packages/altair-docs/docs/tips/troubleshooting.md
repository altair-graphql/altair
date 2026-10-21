---
parent: Tips
---

# Troubleshooting Guide

Having issues with Altair? This comprehensive troubleshooting guide covers the most common problems and their solutions.

## Connection Issues

### "Network Error" or "Failed to fetch"

**Symptoms**: Requests fail with network-related error messages

**Common Causes & Solutions**:

1. **CORS Issues (Web App)**
   - **Problem**: Browser blocks requests due to CORS policy
   - **Solution**: Use desktop app or browser extension instead of web app
   - **Alternative**: Configure your GraphQL server to allow requests from `https://web.altairgraphql.dev`

2. **Incorrect Endpoint URL**
   - **Problem**: Wrong URL format or typo
   - **Check**: Ensure URL includes protocol (`http://` or `https://`)
   - **Example**: `https://api.example.com/graphql` not `api.example.com/graphql`

3. **Server Not Running**
   - **Problem**: Local development server is down
   - **Check**: Verify your GraphQL server is running on the specified port
   - **Test**: Try accessing the endpoint in a browser

4. **SSL/TLS Issues**
   - **Problem**: Certificate errors with HTTPS endpoints
   - **Desktop App**: For development, you may need to configure your system to trust self-signed certificates
   - **Note**: Only bypass certificate validation for development environments, never in production

### "Unauthorized" or 401 Errors

**Authentication problems are common. Here's how to fix them**:

1. **Missing Authorization Header**
   ```
   Header: Authorization
   Value: Bearer your_token_here
   ```

2. **Incorrect Token Format**
   - Some APIs expect `Bearer ` prefix
   - Others expect just the token
   - Check your API documentation

3. **Expired Tokens**
   - **JWT Tokens**: Check expiration time
   - **API Keys**: Verify they haven't been revoked
   - **OAuth**: May need to refresh the token

4. **Wrong Token Permissions**
   - Ensure your token has the required scopes
   - Check if the token allows GraphQL introspection

## Schema Loading Issues

### Schema Won't Load or Shows Empty

**Troubleshooting Steps**:

1. **Check Introspection**
   - Some GraphQL servers disable introspection in production
   - **Test Query**:
   ```graphql
   query {
     __schema {
       types {
         name
       }
     }
   }
   ```

2. **Authentication Required for Schema**
   - Set up authentication headers before reloading schema
   - Some APIs require auth even for introspection

3. **Server Configuration**
   - Verify GraphQL server supports introspection
   - Check if schema endpoint is different from query endpoint

### "GraphQL Schema Error"

**Common Solutions**:

1. **Invalid Schema Definition**
   - Server may have schema validation errors
   - Check server logs for schema compilation issues

2. **Network Timeouts**
   - Large schemas may timeout during introspection
   - Consider breaking down large schemas or optimizing server-side introspection
   - Check server logs for performance issues

## Query Execution Issues

### Query Syntax Errors

**Red underlines in the editor indicate syntax issues**:

1. **Missing Fields in Selection Sets**
   ```graphql
   # ❌ Wrong - no fields selected
   query {
     user
   }
   
   # ✅ Correct
   query {
     user {
       id
       name
     }
   }
   ```

2. **Incorrect Variable Usage**
   ```graphql
   # ❌ Wrong - variable not declared
   query {
     user(id: $userId) {
       name
     }
   }
   
   # ✅ Correct
   query GetUser($userId: ID!) {
     user(id: $userId) {
       name
     }
   }
   ```

### Variables Not Working

**Check these common issues**:

1. **JSON Syntax Errors**
   - Variables must be valid JSON
   - Use double quotes for strings
   - No trailing commas

2. **Variable Type Mismatch**
   ```graphql
   # Query expects String
   query GetUser($name: String!) {
     user(name: $name) { id }
   }
   ```
   ```json
   // Variables should match type
   {
     "name": "John"  // ✅ String
   }
   ```

3. **Required Variables Missing**
   - Variables marked with `!` are required
   - Ensure all required variables are provided

## Performance Issues

### Slow Query Responses

**Optimization Strategies**:

1. **Query Complexity**
   - Avoid deeply nested queries
   - Limit the number of fields requested
   - Use pagination for large datasets

2. **Network Optimization**
   - Use query variables instead of hardcoded values
   - Enable compression if supported by server
   - Consider using query batching

3. **Server-Side Issues**
   - Check server performance monitoring
   - Look for N+1 query problems
   - Verify database query optimization

### Altair Becoming Unresponsive

**When the app freezes or becomes slow**:

1. **Large Response Data**
   - Limit response size with pagination
   - Clear response history: Settings → General → Clear stored data

2. **Memory Issues**
   - Restart Altair
   - Close unnecessary windows
   - Clear browser cache (browser extensions)

## Platform-Specific Issues

### Desktop App Issues

**App Won't Start**:
- Check if antivirus is blocking the application
- Try running as administrator (Windows)
- Clear application data and restart

**Auto-Update Failures**:
- Download latest version manually from website
- Check internet connection
- Verify disk space available

### Browser Extension Issues

**Extension Not Working**:
1. **Check Extension Permissions**
   - Ensure extension has access to the required sites
   - Check if corporate firewall is blocking

2. **Browser Compatibility**
   - Update browser to latest version
   - Disable conflicting extensions
   - Try incognito/private mode

**Content Security Policy (CSP) Errors**:
- Some websites block the extension
- Use desktop app for better compatibility
- See [CSP documentation](/docs/features/csp) for details

### Web App Limitations

**Missing Features**:
- File uploads not supported
- Limited local storage
- CORS restrictions
- Use desktop app for full functionality

## Data and Settings Issues

### Lost Queries or Settings

**Recovery Steps**:

1. **Check Local Storage** (Desktop App)
   - Windows: `%APPDATA%/Altair GraphQL Client`  
   - macOS: `~/Library/Application Support/Altair GraphQL Client`
   - Linux: `~/.config/Altair GraphQL Client`

2. **Export Data Regularly**
   - Settings → Import/Export → Export Application Data
   - Save collections frequently

3. **Cloud Sync Issues**
   - Check internet connection
   - Verify account authentication
   - Try manual sync in settings

### Settings Not Persisting

**Common Causes**:
- Browser privacy mode (extensions)
- Insufficient storage permissions
- Corrupted settings file

**Solutions**:
- Reset settings to defaults
- Clear application data and reconfigure
- Check browser storage permissions

## Plugin Issues

### Plugin Won't Load

**Troubleshooting Steps**:

1. **Check Plugin Format**
   ```
   # Correct format
   altair-graphql-plugin-plugin-name
   
   # With version
   altair-graphql-plugin-plugin-name@1.0.0
   ```

2. **Verify Plugin Source**
   - Ensure plugin exists in npm registry
   - Check plugin compatibility with Altair version

3. **Clear Plugin Cache**
   - Remove plugin from settings
   - Restart Altair
   - Re-add plugin

### Plugin Errors

**Check Console for Errors**:
1. Open Developer Tools (F12)
2. Check Console tab for JavaScript errors
3. Look for plugin-specific error messages

## Getting Help

If you're still experiencing issues:

### Before Asking for Help

1. **Check Error Messages**: Copy exact error text
2. **Note Your Setup**: OS, Altair version, GraphQL server details
3. **Try Minimal Example**: Test with a simple query
4. **Check Recent Changes**: What changed before the issue started?

### Where to Get Support

1. **GitHub Issues**: [Report bugs and request features](https://github.com/altair-graphql/altair/issues)
2. **GitHub Discussions**: [Community support and questions](https://github.com/altair-graphql/altair/discussions)
3. **Documentation**: Check [all documentation sections](/docs/)

### Information to Include

When reporting issues, please provide:
- Altair version and platform
- GraphQL server type and version
- Exact error messages
- Steps to reproduce the issue
- Sample query that causes the problem (if applicable)

### Emergency Workarounds

**If Altair is completely broken**:
1. **Use Alternative GraphQL Clients** temporarily
2. **Use curl for simple requests**:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"query":"{ viewer { login } }"}' \
     https://api.github.com/graphql
   ```
3. **Reinstall Altair** as a last resort

Remember: Most issues have simple solutions. Start with the basics (connection, authentication, syntax) before diving into complex debugging!