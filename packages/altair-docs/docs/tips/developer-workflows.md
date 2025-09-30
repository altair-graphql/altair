---
parent: Tips
---

# Developer Workflows

Streamline your development process with these proven workflow patterns and integration strategies for Altair GraphQL Client.

## Development Environment Setup

### Multi-Stage Development Workflow

**Environment Configuration Strategy**:

```json
{
  "local": {
    "API_URL": "http://localhost:4000/graphql",
    "API_WS_URL": "ws://localhost:4000/graphql",
    "AUTH_TOKEN": "dev_token_123",
    "DEBUG_MODE": "true",
    "CACHE_DISABLED": "true"
  },
  "docker": {
    "API_URL": "http://graphql-api:4000/graphql",
    "API_WS_URL": "ws://graphql-api:4000/graphql",
    "AUTH_TOKEN": "{{DOCKER_AUTH_TOKEN}}",
    "DEBUG_MODE": "true"
  },
  "development": {
    "API_URL": "https://dev-api.example.com/graphql",
    "API_WS_URL": "wss://dev-api.example.com/graphql",
    "AUTH_TOKEN": "{{DEV_AUTH_TOKEN}}",
    "DEBUG_MODE": "true"
  },
  "staging": {
    "API_URL": "https://staging-api.example.com/graphql",
    "API_WS_URL": "wss://staging-api.example.com/graphql",
    "AUTH_TOKEN": "{{STAGING_AUTH_TOKEN}}",
    "DEBUG_MODE": "false"
  },
  "production": {
    "API_URL": "https://api.example.com/graphql",
    "API_WS_URL": "wss://api.example.com/graphql",
    "AUTH_TOKEN": "{{PROD_AUTH_TOKEN}}",
    "DEBUG_MODE": "false"
  }
}
```

### Team Environment Sync

**Environment Template Pattern**:

Create a shared template file (`altair-env-template.json`):

```json
{
  "local": {
    "API_URL": "http://localhost:4000/graphql",
    "AUTH_TOKEN": "YOUR_LOCAL_TOKEN_HERE",
    "USER_ID": "YOUR_TEST_USER_ID"
  },
  "development": {
    "API_URL": "https://dev-api.example.com/graphql",
    "AUTH_TOKEN": "YOUR_DEV_TOKEN_HERE",
    "USER_ID": "YOUR_DEV_USER_ID"
  }
}
```

**Setup Instructions for Team Members**:
1. Copy template to `altair-env.json`
2. Replace placeholder values with personal tokens
3. Add `altair-env.json` to `.gitignore`
4. Import into Altair environment settings

## Feature Development Workflow

### 1. Schema-First Development

**Step 1: Schema Design and Validation**

```graphql
# Define new schema changes first
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  # New field being added
  profile: UserProfile
}

type UserProfile {
  bio: String
  avatar: String
  socialLinks: [SocialLink!]!
}

type SocialLink {
  platform: String!
  url: String!
}
```

**Step 2: Mock Query Development**

Create queries in Altair before implementing server-side:

```graphql
# Test query structure
query GetUserWithProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    profile {
      bio
      avatar
      socialLinks {
        platform
        url
      }
    }
  }
}
```

**Step 3: Server Implementation**

Use Altair queries as implementation specifications:
- Copy queries from Altair to integration tests
- Use the same field structure in resolvers
- Validate responses match expected format

### 2. API-First Development

**Step 1: Explore Existing Schema**

```graphql
# Discover available fields and types
query IntrospectSchema {
  __schema {
    types {
      name
      kind
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}
```

**Step 2: Build Incremental Queries**

Start simple and add complexity:

```graphql
# Version 1: Basic query
query V1_GetUsers {
  users {
    id
    name
  }
}

# Version 2: Add filtering
query V2_GetUsers($filter: UserFilter) {
  users(filter: $filter) {
    id
    name
    email
  }
}

# Version 3: Add relationships
query V3_GetUsers($filter: UserFilter) {
  users(filter: $filter) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}
```

## Integration Workflows

### Frontend Integration

**1. Component Development Workflow**

Use Altair to prototype, then integrate:

```typescript
// 1. Develop in Altair first
const ALTAIR_QUERY = `
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
      profile {
        bio
        avatar
      }
    }
  }
`;

// 2. Copy to application code
const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
      profile {
        bio
        avatar
      }
    }
  }
`;

// 3. Use in React component
function UserProfile({ userId }: { userId: string }) {
  const { loading, error, data } = useQuery(GET_USER_PROFILE, {
    variables: { userId }
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.profile?.bio}</p>
    </div>
  );
}
```

**2. Query Collection to Code Generator**

Create a script to convert Altair collections to code:

```javascript
// collection-to-code.js
const fs = require('fs');

function generateQueryFile(collection) {
  let output = `// Generated from Altair collection: ${collection.name}\n`;
  output += `import { gql } from '@apollo/client';\n\n`;

  collection.queries.forEach(query => {
    const queryName = query.name.replace(/\s+/g, '_').toUpperCase();
    output += `export const ${queryName} = gql\`\n`;
    output += query.query;
    output += `\`;\n\n`;
  });

  return output;
}
```

### Backend Integration

**1. Resolver Development Workflow**

```typescript
// 1. Test query in Altair
const testQuery = `
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      author {
        id
        name
      }
      comments {
        id
        content
        author {
          id
          name
        }
      }
    }
  }
`;

// 2. Implement resolver
const resolvers = {
  Query: {
    post: async (parent, { id }, context) => {
      // Implementation matches Altair query structure
      return await context.db.post.findUnique({
        where: { id },
        include: {
          author: true,
          comments: {
            include: {
              author: true
            }
          }
        }
      });
    }
  }
};
```

**2. Testing Workflow Integration**

```typescript
// Use Altair queries in integration tests
describe('Post API', () => {
  it('should return post with author and comments', async () => {
    const query = `
      query GetPost($id: ID!) {
        post(id: $id) {
          id
          title
          author {
            id
            name
          }
          comments {
            id
            content
          }
        }
      }
    `;

    const variables = { id: 'post_123' };
    const result = await testClient.query({ query, variables });

    expect(result.data.post).toBeDefined();
    expect(result.data.post.author).toBeDefined();
    expect(result.data.post.comments).toBeInstanceOf(Array);
  });
});
```

## Debugging Workflows

### 1. Error Investigation Process

**Step 1: Error Reproduction**

```graphql
# Minimal reproduction case
query ReproduceError {
  problematicField {
    id
    # Add fields one by one to isolate issue
  }
}
```

**Step 2: Error Analysis**

Review error details in the response pane:
- Error messages and descriptions
- Error paths showing where issues occurred
- Error extensions with additional context
- Stack traces (if available)

**Step 3: Environment-Specific Testing**

Use Altair's environment feature to test against different API instances:
- Local development endpoints
- Staging/QA environments
- Production (with caution)

Switch between environments to verify behavior across different stages of deployment.

### 2. Performance Debugging

**Query Performance Analysis**:

Monitor query performance using the response stats shown in Altair:
- Response time displayed at bottom of result pane
- Compare response times across different queries
- Identify slow queries that need optimization

**Performance categorization**:
- Fast queries: < 100ms
- Acceptable: 100-500ms  
- Slow: > 500ms
- Needs optimization: > 1000ms
} else if (duration < 500) {
  console.log('⚠️ Moderate query');
} else {
  console.log('🐌 Slow query - needs optimization');
}
```

## Code Review Workflows

### 1. Query Review Checklist

**Before Merging GraphQL Changes**:

```markdown
## GraphQL Query Review Checklist

### Performance
- [ ] Query requests only necessary fields
- [ ] Appropriate pagination limits used
- [ ] Query depth is reasonable (< 10 levels)
- [ ] No obvious N+1 query patterns

### Security
- [ ] Proper authorization checks
- [ ] Input validation for variables
- [ ] No sensitive data exposure
- [ ] Rate limiting considerations

### Maintainability
- [ ] Query has descriptive operation name
- [ ] Variables are properly typed
- [ ] Fragments used for reusable fields
- [ ] Query is documented/commented

### Testing
- [ ] Query tested in multiple environments
- [ ] Error scenarios tested
- [ ] Performance benchmarked
- [ ] Integration tests updated
```

### 2. Schema Review Process

**Schema Change Review**:

```graphql
# Before: Original schema
type User {
  id: ID!
  name: String!
  email: String!
}

# After: Proposed changes
type User {
  id: ID!
  name: String!
  email: String!
  # New field - check breaking changes
  profile: UserProfile
  # Deprecated field - migration path needed
  fullName: String @deprecated(reason: "Use 'name' instead")
}

type UserProfile {
  bio: String
  avatar: String
}
```

**Breaking Change Analysis**:
- Use Altair to test existing queries against new schema
- Identify queries that will break
- Create migration plan
- Document deprecation timeline

## Deployment Workflows

### 1. Pre-Deployment Testing

**Deployment Readiness Checklist**:

```javascript
// Pre-deployment test script
const tests = [
  {
    name: 'Health Check',
    query: 'query { __schema { types { name } } }',
    expected: (result) => !result.errors
  },
  {
    name: 'Authentication',
    query: 'query { me { id } }',
    expected: (result) => result.data?.me?.id
  },
  {
    name: 'Core Functionality',
    query: 'query { users(first: 1) { id } }',
    expected: (result) => result.data?.users?.length >= 0
  }
];

// Run tests
tests.forEach(async (test) => {
  try {
    const result = await runQuery(test.query);
    const passed = test.expected(result);
    console.log(`${test.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  } catch (error) {
    console.log(`${test.name}: ❌ ERROR - ${error.message}`);
  }
});
```

### 2. Production Monitoring Setup

**Production Health Queries**:

```graphql
# Health check query
query HealthCheck {
  __schema {
    queryType {
      name
    }
  }
}

# System status query
query SystemStatus {
  systemInfo {
    version
    uptime
    status
  }
}

# Performance monitoring query
query PerformanceCheck {
  stats {
    queryCount
    averageResponseTime
    errorRate
  }
}
```

## Documentation Workflows

### 1. Query Documentation Standards

```graphql
"""
Retrieves user profile information with associated posts and preferences.

This query is used by:
- User profile page
- Account settings page
- Admin user management

Performance notes:
- Response time should be < 200ms
- Consider pagination for users with many posts

Authentication required: Yes
Rate limit: 100 requests per minute per user

Example usage:
- userId: "user_123" (valid user ID)
- includePreferences: true (to load user preferences)

Last updated: 2024-01-15
Maintainer: @username
"""
query GetUserProfile(
  $userId: ID!
  $includePreferences: Boolean = false
) {
  user(id: $userId) {
    id
    name
    email
    bio
    avatar
    
    posts(first: 10) {
      id
      title
      createdAt
    }
    
    preferences @include(if: $includePreferences) {
      theme
      language
      notifications
    }
  }
}
```

### 2. Collection Documentation

Maintain collection documentation alongside queries:

```json
{
  "collection_name": "User Management API",
  "description": "Core user operations for the platform",
  "version": "1.2.0",
  "last_updated": "2024-01-15",
  "maintainer": "backend-team@company.com",
  "environment_requirements": {
    "AUTH_TOKEN": "Required - User must have 'user:read' scope",
    "API_URL": "GraphQL endpoint URL"
  },
  "common_variables": {
    "userId": "Standard user identifier (UUID format)",
    "includeDeleted": "Boolean flag to include soft-deleted records"
  },
  "queries": [
    {
      "name": "Get User Profile",
      "file": "get-user-profile.graphql",
      "description": "Retrieves complete user profile",
      "auth_required": true,
      "performance_notes": "Avg response time: 150ms"
    }
  ]
}
```

By following these developer workflows, you'll have a structured, efficient approach to GraphQL development that scales with your team and project complexity. Remember to adapt these patterns to your specific technology stack and team practices.