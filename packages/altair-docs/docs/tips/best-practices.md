---
parent: Tips
---

# Best Practices

Maximize your productivity with Altair by following these proven best practices and workflow optimizations.

## Query Organization

### Use Collections Effectively

**Organize by Project or Feature**:
```
📁 User Management
  ├── Create User
  ├── Update Profile
  ├── Delete Account
  └── 📁 Authentication
      ├── Login
      ├── Refresh Token
      └── Logout

📁 E-commerce
  ├── 📁 Products
  │   ├── List Products
  │   ├── Product Details
  │   └── Search Products
  └── 📁 Orders
      ├── Create Order
      ├── Order Status
      └── Order History
```

**Naming Conventions**:
- Use descriptive names: `Get User Profile` not `Query 1`
- Include HTTP verb: `Create Product`, `Update Inventory`
- Add context when needed: `Admin - Delete User`, `Guest - Browse Products`

### Query Structure Best Practices

**Use Fragments for Reusable Fields**:
```graphql
fragment UserInfo on User {
  id
  name
  email
  avatar
}

query GetUsers {
  users {
    ...UserInfo
    role
  }
}

query GetCurrentUser {
  me {
    ...UserInfo
    preferences
  }
}
```

**Meaningful Operation Names**:
```graphql
# ✅ Good - descriptive and specific
query GetUserProfileWithPreferences($userId: ID!) {
  user(id: $userId) {
    id
    name
    preferences {
      theme
      language
    }
  }
}

# ❌ Avoid - generic and uninformative
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
  }
}
```

## Environment Management

### Multi-Environment Setup

**Recommended Environment Structure** (use snake_case for environment variables):
```json
{
  "local": {
    "api_url": "http://localhost:4000/graphql",
    "auth_token": "dev_token_123",
    "debug": "true"
  },
  "development": {
    "api_url": "https://dev-api.example.com/graphql",
    "auth_token": "{{dev_auth_token}}",
    "debug": "true"
  },
  "staging": {
    "api_url": "https://staging-api.example.com/graphql",
    "auth_token": "{{staging_auth_token}}",
    "debug": "false"
  },
  "production": {
    "api_url": "https://api.example.com/graphql",
    "auth_token": "{{prod_auth_token}}",
    "debug": "false"
  }
}
```

**Security Best Practices**:
- Never store production tokens directly in environment variables
- Use placeholder tokens like `{{PROD_AUTH_TOKEN}}` and fill them in locally
- Keep sensitive environments (staging, prod) in separate Altair instances
- Regularly rotate API keys and tokens

### Variable Naming Conventions

**Use Consistent Prefixes**:
```json
{
  "API_URL": "https://api.example.com/graphql",
  "API_TIMEOUT": "30000",
  "AUTH_TOKEN": "bearer_token_here",
  "AUTH_REFRESH_TOKEN": "refresh_token_here",
  "DB_USER_ID": "12345",
  "FEATURE_FLAG_NEW_UI": "true"
}
```

## Authentication Strategies

### Token Management

**Automated Token Refresh**:
- Store tokens in environment variables
- Use Altair's environment system to manage different tokens for different stages
- Check token expiry before sending requests
- Store refresh tokens securely

**Best practices for token storage**:
- Never commit tokens to version control
- Use environment-specific tokens
- Rotate tokens regularly
- Use short-lived access tokens with refresh tokens

### Environment-Specific Authentication

**Different Auth Methods per Environment**:
- Local: Simple API keys for development
- Development: JWT tokens with longer expiry
- Staging: Production-like OAuth setup
- Production: Full OAuth flow with short-lived tokens

Configure headers in Altair's header pane per environment for secure authentication.

## Testing and Debugging

### Systematic Query Testing

**Test with Incremental Complexity**:
1. **Start Simple**: Test basic field queries first
2. **Add Parameters**: Test with variables and arguments
3. **Add Nesting**: Test relationships and nested queries
4. **Add Mutations**: Test data modifications
5. **Error Scenarios**: Test with invalid data

**Example Testing Flow**:
```graphql
# Step 1: Basic query
query {
  users {
    id
    name
  }
}

# Step 2: Add filtering
query GetActiveUsers {
  users(filter: { status: ACTIVE }) {
    id
    name
    status
  }
}

# Step 3: Add pagination
query GetActiveUsersPage($first: Int!, $after: String) {
  users(filter: { status: ACTIVE }, first: $first, after: $after) {
    edges {
      node {
        id
        name
        status
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Step 4: Test error scenarios
query GetUserWithInvalidId {
  user(id: "invalid-id") {
    id
    name
  }
}
```

### Performance Testing

**Monitor Query Performance**:
- Use response stats to track query execution time
- Set benchmarks for acceptable response times
- Test with realistic data volumes
- Monitor for N+1 query patterns

**Query Optimization Checklist**:
- [ ] Request only necessary fields
- [ ] Use appropriate pagination limits
- [ ] Avoid deeply nested queries
- [ ] Consider query complexity scoring
- [ ] Use query batching when appropriate

## Collaboration Workflows

### Team Collaboration

**Collection Sharing Strategy**:
1. **Maintain Master Collections**: Keep authoritative collections in version control
2. **Environment Separation**: Each team member maintains their own environment variables
3. **Regular Sync**: Export/import collections regularly to stay in sync
4. **Documentation**: Include query descriptions and usage notes

**Collection Documentation Format**:
```graphql
"""
Get user profile with preferences and settings
Used by: Dashboard, Profile Page
Requirements: User must be authenticated
Test with: userId = "user_123"
Expected response time: < 200ms
"""
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    preferences {
      theme
      language
    }
  }
}
```

### Code Integration

**Export for Production Code**:
- Use Altair to prototype queries
- Export working queries to your application
- Maintain consistency between Altair collections and code
- Use Altair for API regression testing

## Maintenance and Cleanup

### Regular Maintenance Tasks

**Weekly**:
- [ ] Clear query history if it's getting large
- [ ] Review and clean up unused collections
- [ ] Update environment variables if needed
- [ ] Check for Altair updates

**Monthly**:
- [ ] Export important collections as backup
- [ ] Review and update authentication tokens
- [ ] Clean up old environment configurations
- [ ] Update plugin versions if needed

**Project Completion**:
- [ ] Archive project-specific collections
- [ ] Export final queries for documentation
- [ ] Clean up temporary test data
- [ ] Update shared team collections

### Performance Optimization

**Keep Altair Running Smoothly**:
- Limit query history size (Settings → General → Query history depth)
- Close unused windows
- Clear response data for large responses
- Restart Altair periodically for long sessions

**Storage Management**:
- Export and delete old collections you no longer need
- Clear cached schema data if it becomes stale
- Monitor disk usage for desktop app data directory

## Security Best Practices

### Data Protection

**Sensitive Data Handling**:
- Never commit environment files with real tokens to version control
- Use placeholder values for production credentials
- Regularly rotate API keys and tokens
- Be cautious with screenshot sharing (may contain sensitive data)

**Access Control**:
- Use different Altair instances/profiles for different security levels
- Limit production access to necessary team members only
- Consider using temporary tokens for testing
- Log and monitor API usage where possible

### Schema Security

**Information Disclosure**:
- Be aware that GraphQL introspection can reveal schema structure
- Don't share schema screenshots with unauthorized parties
- Understand what information your GraphQL endpoint exposes
- Consider disabling introspection in production environments

By following these best practices, you'll have a more organized, secure, and efficient GraphQL development workflow with Altair. Remember to adapt these practices to your team's specific needs and constraints.