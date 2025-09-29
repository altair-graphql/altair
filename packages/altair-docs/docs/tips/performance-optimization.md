---
parent: Tips
---

# Performance Optimization

Learn how to optimize both your GraphQL queries and Altair usage for maximum performance and efficiency.

## GraphQL Query Optimization

### Query Structure Optimization

**1. Request Only What You Need**

```graphql
# ❌ Over-fetching - requesting unnecessary data
query GetUsers {
  users {
    id
    name
    email
    bio
    avatar
    createdAt
    updatedAt
    lastLoginAt
    preferences {
      theme
      language
      notifications
      privacy
    }
    posts {
      id
      title
      content
      createdAt
      comments {
        id
        content
        author {
          id
          name
          avatar
        }
      }
    }
  }
}

# ✅ Optimized - only requesting needed fields
query GetUsersForList {
  users {
    id
    name
    avatar
  }
}
```

**2. Use Pagination Wisely**

```graphql
# ✅ Cursor-based pagination for large datasets
query GetPostsPaginated($first: Int!, $after: String) {
  posts(first: $first, after: $after) {
    edges {
      node {
        id
        title
        excerpt
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Variables
{
  "first": 20,
  "after": "cursor_string_here"
}
```

**3. Batch Related Queries**

```graphql
# ✅ Single query for multiple related resources
query GetDashboardData($userId: ID!) {
  user(id: $userId) {
    id
    name
    stats {
      totalPosts
      totalComments
      followers
    }
  }
  recentPosts: posts(authorId: $userId, first: 5) {
    id
    title
    createdAt
  }
  notifications(userId: $userId, unreadOnly: true) {
    id
    message
    createdAt
  }
}
```

### Advanced Query Patterns

**4. Use Fragments for Consistency and Performance**

```graphql
# Define reusable fragments
fragment PostSummary on Post {
  id
  title
  excerpt
  createdAt
  author {
    id
    name
    avatar
  }
}

fragment UserProfile on User {
  id
  name
  avatar
  bio
}

# Use fragments in queries
query GetFeed($first: Int!) {
  posts(first: $first) {
    ...PostSummary
  }
  
  suggestedUsers {
    ...UserProfile
  }
}
```

**5. Conditional Fields with Directives**

```graphql
query GetPost($id: ID!, $includeComments: Boolean = false) {
  post(id: $id) {
    id
    title
    content
    author {
      id
      name
    }
    comments @include(if: $includeComments) {
      id
      content
      author {
        id
        name
      }
    }
  }
}
```

## Query Performance Monitoring

### Using Altair's Performance Features

**1. Response Time Monitoring**

Monitor query performance directly in Altair:
- Check response stats in the result pane
- Set performance benchmarks for different query types
- Track performance degradation over time

**2. Query Complexity Analysis**

Use pre-request scripts to analyze query complexity:

```javascript
// Pre-request script to log query complexity
const query = altair.helpers.getCurrentQuery();
const complexity = calculateQueryComplexity(query);

console.log(`Query complexity: ${complexity}`);

if (complexity > 100) {
  console.warn('High complexity query detected!');
}

function calculateQueryComplexity(query) {
  // Simple complexity calculation
  const fieldCount = (query.match(/\w+\s*\{/g) || []).length;
  const depthCount = (query.match(/{/g) || []).length;
  return fieldCount * depthCount;
}
```

**3. Performance Benchmarking**

Set up automated performance testing:

```javascript
// Pre-request script for performance benchmarking
const startTime = Date.now();
altair.helpers.setEnvironment('QUERY_START_TIME', startTime);

// Post-request script
const startTime = altair.helpers.getEnvironment('QUERY_START_TIME');
const endTime = Date.now();
const duration = endTime - startTime;

console.log(`Query execution time: ${duration}ms`);

// Log slow queries
if (duration > 1000) {
  console.warn(`Slow query detected: ${duration}ms`);
  // Could send to monitoring service
}
```

## Server-Side Optimization Tips

### Query Optimization Strategies

**1. Implement Query Depth Limiting**

Protect against overly deep queries:

```graphql
# Configure your GraphQL server to limit query depth
# Example configuration (varies by server implementation)
{
  "queryDepthLimit": 10,
  "queryComplexityLimit": 1000
}
```

**2. Use DataLoader for N+1 Prevention**

Understanding N+1 problems and how to avoid them:

```graphql
# This query could cause N+1 problems
query GetPostsWithAuthors {
  posts {
    id
    title
    author {  # Potential N+1 query
      id
      name
    }
  }
}
```

**3. Implement Query Caching**

- Use HTTP caching headers where appropriate
- Implement query result caching on the server
- Consider using Apollo Cache or similar solutions

## Altair Application Performance

### Optimizing Altair Usage

**1. Memory Management**

Keep Altair running efficiently:

```javascript
// Clean up large responses periodically
// Settings → General → Query history depth: 50
// Clear response data for large queries after use
```

**2. Window Management**

- Close unused query windows
- Limit the number of concurrent windows (recommended: < 10)
- Use collections instead of keeping many windows open

**3. Schema Caching**

Optimize schema loading:
- Enable schema auto-refresh only when needed
- Cache schemas locally for frequently used endpoints
- Use schema stitching for better performance with large schemas

### Extension and Plugin Performance

**4. Plugin Optimization**

- Only install plugins you actively use
- Remove unused plugins to reduce memory footprint
- Keep plugins updated for performance improvements

**5. Browser Extension Performance**

For browser extension users:
- Close unnecessary browser tabs
- Disable conflicting extensions
- Use desktop app for intensive GraphQL work

## Network Optimization

### Request Optimization

**1. HTTP/2 and Connection Reuse**

Ensure your GraphQL server supports HTTP/2:
- Better multiplexing of requests
- Reduced connection overhead
- Improved performance for multiple queries

**2. Compression**

Enable response compression:

```javascript
// Pre-request script to request compressed responses
altair.helpers.setHeader('Accept-Encoding', 'gzip, deflate, br');
```

**3. Request Batching**

For multiple queries, consider batching:

```graphql
# Instead of multiple separate requests
[
  { "query": "query { user(id: \"1\") { name } }" },
  { "query": "query { user(id: \"2\") { name } }" },
  { "query": "query { user(id: \"3\") { name } }" }
]
```

## Caching Strategies

### Client-Side Caching

**1. Query Result Caching**

Implement caching in your applications:

```javascript
// Example caching strategy
const cache = new Map();

function getCachedQuery(query, variables) {
  const key = `${query}:${JSON.stringify(variables)}`;
  return cache.get(key);
}

function setCachedQuery(query, variables, result) {
  const key = `${query}:${JSON.stringify(variables)}`;
  cache.set(key, {
    result,
    timestamp: Date.now(),
    ttl: 5 * 60 * 1000 // 5 minutes
  });
}
```

**2. Environment Variable Caching**

Cache frequently used environment variables:

```javascript
// Pre-request script with caching
let cachedToken = altair.helpers.getEnvironment('CACHED_AUTH_TOKEN');
let tokenExpiry = altair.helpers.getEnvironment('TOKEN_EXPIRY');

if (!cachedToken || Date.now() > tokenExpiry) {
  // Refresh token logic here
  // ... token refresh code ...
  
  altair.helpers.setEnvironment('CACHED_AUTH_TOKEN', newToken);
  altair.helpers.setEnvironment('TOKEN_EXPIRY', Date.now() + 3600000); // 1 hour
}
```

## Performance Monitoring and Debugging

### Setting Up Performance Monitoring

**1. Response Time Tracking**

Track and analyze response times:

```javascript
// Post-request script for performance tracking
const responseTime = altair.data.response.responseTime;
const queryName = altair.data.query.operationName || 'Anonymous';

// Log performance data
console.log(`${queryName}: ${responseTime}ms`);

// Alert on slow queries
if (responseTime > 2000) {
  console.warn(`Slow query alert: ${queryName} took ${responseTime}ms`);
}

// Store performance data for analysis
const performanceData = JSON.parse(
  altair.helpers.getEnvironment('PERFORMANCE_LOG') || '[]'
);

performanceData.push({
  query: queryName,
  responseTime: responseTime,
  timestamp: Date.now()
});

// Keep only last 100 entries
if (performanceData.length > 100) {
  performanceData.shift();
}

altair.helpers.setEnvironment('PERFORMANCE_LOG', JSON.stringify(performanceData));
```

**2. Error Rate Monitoring**

Track query success/failure rates:

```javascript
// Post-request script for error tracking
const hasErrors = altair.data.response.body.errors && 
                  altair.data.response.body.errors.length > 0;

let errorCount = parseInt(altair.helpers.getEnvironment('ERROR_COUNT') || '0');
let totalCount = parseInt(altair.helpers.getEnvironment('TOTAL_COUNT') || '0');

if (hasErrors) {
  errorCount++;
}
totalCount++;

const errorRate = (errorCount / totalCount) * 100;

altair.helpers.setEnvironment('ERROR_COUNT', errorCount.toString());
altair.helpers.setEnvironment('TOTAL_COUNT', totalCount.toString());

console.log(`Error rate: ${errorRate.toFixed(2)}%`);
```

## Troubleshooting Performance Issues

### Common Performance Problems

**1. Slow Query Responses**

Diagnostic steps:
- Check network latency
- Analyze query complexity
- Review server logs
- Test with simplified queries

**2. Memory Issues in Altair**

Solutions:
- Clear query history regularly
- Close unused windows
- Restart Altair periodically
- Reduce response data retention

**3. Network Timeouts**

Fixes:
- Increase timeout settings
- Optimize query structure
- Check server performance
- Consider query splitting

### Performance Testing Checklist

**Before Deploying Queries**:
- [ ] Test with realistic data volumes
- [ ] Verify response times under load
- [ ] Check memory usage with large responses
- [ ] Test error handling performance
- [ ] Validate caching effectiveness
- [ ] Monitor server resource usage

**Regular Performance Audits**:
- [ ] Review slowest queries monthly
- [ ] Update query patterns based on performance data
- [ ] Clean up unused collections and queries
- [ ] Update environment configurations
- [ ] Check for new optimization opportunities

By following these performance optimization strategies, you'll ensure that both your GraphQL queries and Altair usage remain fast and efficient, even as your applications and data grow in complexity.