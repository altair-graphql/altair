---
parent: Tips
---

# Advanced Usage Patterns

Discover powerful techniques and patterns for advanced Altair GraphQL Client usage that can significantly improve your GraphQL development workflow.

## Dynamic Query Generation

### Template-Based Query Building

Use pre-request scripts to generate queries dynamically:

```javascript
// Pre-request script for dynamic query generation
const entityType = altair.helpers.getEnvironment('ENTITY_TYPE') || 'User';
const fields = JSON.parse(altair.helpers.getEnvironment('QUERY_FIELDS') || '["id", "name"]');
const includeRelations = altair.helpers.getEnvironment('INCLUDE_RELATIONS') === 'true';

// Build field selection dynamically
let fieldSelection = fields.join('\n    ');

if (includeRelations && entityType === 'User') {
  fieldSelection += `
    posts {
      id
      title
    }
    profile {
      bio
      avatar
    }`;
}

const dynamicQuery = `
  query Get${entityType}($id: ID!) {
    ${entityType.toLowerCase()}(id: $id) {
      ${fieldSelection}
    }
  }
`;

// Update the query in Altair
altair.helpers.setQuery(dynamicQuery);

console.log('Generated query:', dynamicQuery);
```

### Conditional Query Building

Build queries based on runtime conditions:

```javascript
// Pre-request script for conditional queries
const userRole = altair.helpers.getEnvironment('USER_ROLE');
const includeAdminFields = userRole === 'admin';

let queryFields = `
  id
  name
  email
`;

if (includeAdminFields) {
  queryFields += `
  role
  permissions
  lastLoginAt
  createdBy {
    id
    name
  }`;
}

const conditionalQuery = `
  query GetUser($id: ID!) {
    user(id: $id) {
      ${queryFields}
    }
  }
`;

altair.helpers.setQuery(conditionalQuery);
```

## Advanced Environment Management

### Multi-Tier Environment Switching

Set up complex environment hierarchies:

```json
{
  "base": {
    "API_TIMEOUT": "10000",
    "RETRY_COUNT": "3",
    "DEBUG": "false"
  },
  "development": {
    "API_URL": "http://localhost:4000/graphql",
    "API_WS_URL": "ws://localhost:4000/graphql",
    "AUTH_TOKEN": "dev_token_123",
    "DEBUG": "true",
    "API_TIMEOUT": "30000"
  },
  "staging": {
    "API_URL": "https://staging-api.example.com/graphql",
    "API_WS_URL": "wss://staging-api.example.com/graphql",
    "AUTH_TOKEN": "{{STAGING_AUTH_TOKEN}}",
    "DEBUG": "false"
  },
  "production": {
    "API_URL": "https://api.example.com/graphql",
    "API_WS_URL": "wss://api.example.com/graphql",
    "AUTH_TOKEN": "{{PROD_AUTH_TOKEN}}",
    "DEBUG": "false",
    "API_TIMEOUT": "5000"
  },
  "local-with-prod-data": {
    "API_URL": "http://localhost:4000/graphql",
    "API_WS_URL": "ws://localhost:4000/graphql",
    "AUTH_TOKEN": "{{PROD_AUTH_TOKEN}}",
    "DEBUG": "true",
    "DATA_SOURCE": "production-snapshot"
  }
}
```

### Environment Inheritance Script

```javascript
// Pre-request script for environment inheritance
const currentEnv = altair.helpers.getEnvironment('ENVIRONMENT_NAME');
const baseConfig = {
  'API_TIMEOUT': '10000',
  'RETRY_COUNT': '3',
  'DEBUG': 'false'
};

// Apply base configuration if not already set
Object.keys(baseConfig).forEach(key => {
  if (!altair.helpers.getEnvironment(key)) {
    altair.helpers.setEnvironment(key, baseConfig[key]);
  }
});

// Environment-specific adjustments
if (currentEnv === 'development') {
  altair.helpers.setHeader('X-Debug-Mode', 'true');
  altair.helpers.setHeader('X-Developer', 'your-name');
} else if (currentEnv === 'production') {
  altair.helpers.setHeader('X-Environment', 'production');
  altair.helpers.setHeader('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
}
```

## Advanced Authentication Patterns

### Multi-Provider Authentication

Handle different authentication providers:

```javascript
// Pre-request script for multi-provider auth
const authProvider = altair.helpers.getEnvironment('AUTH_PROVIDER') || 'jwt';

switch (authProvider) {
  case 'jwt':
    const jwtToken = altair.helpers.getEnvironment('JWT_TOKEN');
    if (jwtToken) {
      altair.helpers.setHeader('Authorization', `Bearer ${jwtToken}`);
    }
    break;
    
  case 'oauth':
    const oauthToken = altair.helpers.getEnvironment('OAUTH_TOKEN');
    if (oauthToken) {
      altair.helpers.setHeader('Authorization', `Bearer ${oauthToken}`);
    }
    break;
    
  case 'apikey':
    const apiKey = altair.helpers.getEnvironment('API_KEY');
    if (apiKey) {
      altair.helpers.setHeader('X-API-Key', apiKey);
    }
    break;
    
  case 'basic':
    const username = altair.helpers.getEnvironment('BASIC_USERNAME');
    const password = altair.helpers.getEnvironment('BASIC_PASSWORD');
    if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      altair.helpers.setHeader('Authorization', `Basic ${credentials}`);
    }
    break;
    
  case 'custom':
    const customAuth = altair.helpers.getEnvironment('CUSTOM_AUTH_HEADER');
    const customValue = altair.helpers.getEnvironment('CUSTOM_AUTH_VALUE');
    if (customAuth && customValue) {
      altair.helpers.setHeader(customAuth, customValue);
    }
    break;
}
```

### Token Rotation with Fallback

```javascript
// Pre-request script for token rotation
const primaryToken = altair.helpers.getEnvironment('PRIMARY_TOKEN');
const secondaryToken = altair.helpers.getEnvironment('SECONDARY_TOKEN');
const tokenExpiry = parseInt(altair.helpers.getEnvironment('TOKEN_EXPIRY') || '0');
const currentTime = Math.floor(Date.now() / 1000);

let activeToken = primaryToken;

// Check if primary token is expired
if (tokenExpiry && currentTime >= tokenExpiry) {
  console.log('Primary token expired, switching to secondary token');
  activeToken = secondaryToken;
  
  // Trigger token refresh in background
  if (altair.helpers.getEnvironment('AUTO_REFRESH_TOKEN') === 'true') {
    refreshTokenInBackground();
  }
}

if (activeToken) {
  altair.helpers.setHeader('Authorization', `Bearer ${activeToken}`);
} else {
  console.warn('No valid authentication token available');
}

async function refreshTokenInBackground() {
  try {
    const refreshToken = altair.helpers.getEnvironment('REFRESH_TOKEN');
    if (!refreshToken) return;
    
    const response = await altair.helpers.request({
      url: altair.helpers.getEnvironment('TOKEN_REFRESH_URL'),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = JSON.parse(response.body);
    if (data.accessToken) {
      altair.helpers.setEnvironment('PRIMARY_TOKEN', data.accessToken);
      altair.helpers.setEnvironment('TOKEN_EXPIRY', (currentTime + data.expiresIn).toString());
      console.log('Token refreshed successfully');
    }
  } catch (error) {
    console.error('Token refresh failed:', error.message);
  }
}
```

## Advanced Error Handling

### Comprehensive Error Processing

```javascript
// Post-request script for advanced error handling
const response = altair.data.response.body;
const statusCode = altair.data.response.status;

// Error classification system
const errorClassifier = {
  classify: (error) => {
    const code = error.extensions?.code;
    const message = error.message.toLowerCase();
    
    if (statusCode === 401 || code === 'UNAUTHENTICATED') {
      return 'AUTH_ERROR';
    } else if (statusCode === 403 || code === 'FORBIDDEN') {
      return 'PERMISSION_ERROR';
    } else if (statusCode === 429 || code === 'RATE_LIMITED') {
      return 'RATE_LIMIT_ERROR';
    } else if (statusCode >= 500 || code === 'INTERNAL_ERROR') {
      return 'SERVER_ERROR';
    } else if (message.includes('validation') || code === 'BAD_USER_INPUT') {
      return 'VALIDATION_ERROR';
    } else if (message.includes('not found') || code === 'NOT_FOUND') {
      return 'NOT_FOUND_ERROR';
    } else {
      return 'UNKNOWN_ERROR';
    }
  },
  
  getAction: (classification) => {
    const actions = {
      'AUTH_ERROR': 'Please check your authentication token',
      'PERMISSION_ERROR': 'You do not have permission for this operation',
      'RATE_LIMIT_ERROR': 'Rate limit exceeded, please wait before retrying',
      'SERVER_ERROR': 'Server error occurred, please try again later',
      'VALIDATION_ERROR': 'Please check your input data',
      'NOT_FOUND_ERROR': 'The requested resource was not found',
      'UNKNOWN_ERROR': 'An unexpected error occurred'
    };
    return actions[classification] || actions['UNKNOWN_ERROR'];
  }
};

if (response.errors) {
  console.group('🚨 Error Analysis:');
  
  const errorSummary = response.errors.map(error => {
    const classification = errorClassifier.classify(error);
    const suggestedAction = errorClassifier.getAction(classification);
    
    return {
      message: error.message,
      path: error.path,
      classification,
      suggestedAction,
      code: error.extensions?.code,
      location: error.locations
    };
  });
  
  // Group errors by classification
  const groupedErrors = errorSummary.reduce((acc, error) => {
    if (!acc[error.classification]) {
      acc[error.classification] = [];
    }
    acc[error.classification].push(error);
    return acc;
  }, {});
  
  Object.keys(groupedErrors).forEach(classification => {
    console.group(`${classification} (${groupedErrors[classification].length} errors):`);
    groupedErrors[classification].forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`);
      if (error.path) {
        console.log(`   Path: ${error.path.join(' → ')}`);
      }
      console.log(`   Action: ${error.suggestedAction}`);
    });
    console.groupEnd();
  });
  
  console.groupEnd();
  
  // Auto-retry logic for specific error types
  const retryableErrors = ['RATE_LIMIT_ERROR', 'SERVER_ERROR'];
  const hasRetryableError = errorSummary.some(e => retryableErrors.includes(e.classification));
  
  if (hasRetryableError) {
    const retryCount = parseInt(altair.helpers.getEnvironment('RETRY_COUNT') || '0');
    const maxRetries = parseInt(altair.helpers.getEnvironment('MAX_RETRIES') || '3');
    
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`Will retry in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => {
        altair.helpers.setEnvironment('RETRY_COUNT', (retryCount + 1).toString());
        // Trigger retry (would need custom implementation)
      }, delay);
    }
  } else {
    altair.helpers.setEnvironment('RETRY_COUNT', '0');
  }
}
```

## Advanced Query Patterns

### Query Composition and Fragments

```graphql
# Define base fragments
fragment BaseUser on User {
  id
  name
  email
  createdAt
}

fragment UserProfile on User {
  ...BaseUser
  profile {
    bio
    avatar
    website
    socialLinks {
      platform
      url
    }
  }
}

fragment UserActivity on User {
  ...BaseUser
  posts(first: 5) {
    id
    title
    createdAt
  }
  comments(first: 10) {
    id
    content
    post {
      id
      title
    }
  }
}

fragment UserStats on User {
  ...BaseUser
  statistics {
    postCount
    commentCount
    followerCount
    followingCount
  }
}

# Compose different views using fragments
query UserDashboard($userId: ID!) {
  user(id: $userId) {
    ...UserProfile
    ...UserActivity
    ...UserStats
  }
}

query UserList {
  users(first: 20) {
    ...BaseUser
    # Only basic info for list view
  }
}

query UserCard($userId: ID!) {
  user(id: $userId) {
    ...UserProfile
    # Profile info for card view
  }
}
```

### Advanced Pagination Patterns

```graphql
# Cursor-based pagination with metadata
query AdvancedPagination(
  $first: Int!
  $after: String
  $filters: PostFilters
  $sortBy: PostSortInput
) {
  posts(
    first: $first
    after: $after
    filters: $filters
    sortBy: $sortBy
  ) {
    edges {
      node {
        id
        title
        content
        author {
          id
          name
        }
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
    # Advanced metadata
    aggregations {
      byAuthor {
        authorId
        count
      }
      byCategory {
        category
        count
      }
      byDate {
        date
        count
      }
    }
  }
}
```

### Conditional Queries with Directives

```graphql
query ConditionalData(
  $userId: ID!
  $includeProfile: Boolean = false
  $includePosts: Boolean = false
  $includeActivity: Boolean = false
  $isAdmin: Boolean = false
  $postLimit: Int = 10
) {
  user(id: $userId) {
    id
    name
    email
    
    # Profile information (conditional)
    profile @include(if: $includeProfile) {
      bio
      avatar
      website
      preferences {
        theme
        language
      }
    }
    
    # Posts (conditional with variable limit)
    posts(first: $postLimit) @include(if: $includePosts) {
      id
      title
      content
      createdAt
    }
    
    # Recent activity (conditional)
    recentActivity @include(if: $includeActivity) {
      id
      type
      createdAt
      metadata
    }
    
    # Admin-only fields
    adminInfo @include(if: $isAdmin) {
      lastLoginAt
      ipAddress
      deviceInfo
      securityFlags
    }
    
    # Skip expensive fields for mobile
    expensiveData @skip(if: $isMobile) {
      complexCalculation
      heavyAggregation
    }
  }
}
```

## Advanced Subscription Patterns

### Smart Subscription Management

```javascript
// Pre-request script for subscription management
const subscriptionManager = {
  activeSubscriptions: new Map(),
  
  startSubscription: (name, query, variables = {}) => {
    // Check if subscription already exists
    if (subscriptionManager.activeSubscriptions.has(name)) {
      console.log(`Subscription ${name} already active`);
      return;
    }
    
    console.log(`Starting subscription: ${name}`);
    subscriptionManager.activeSubscriptions.set(name, {
      query,
      variables,
      startTime: Date.now(),
      messageCount: 0
    });
  },
  
  stopSubscription: (name) => {
    if (subscriptionManager.activeSubscriptions.has(name)) {
      const sub = subscriptionManager.activeSubscriptions.get(name);
      const duration = Date.now() - sub.startTime;
      console.log(`Stopped subscription ${name} after ${duration}ms, received ${sub.messageCount} messages`);
      subscriptionManager.activeSubscriptions.delete(name);
    }
  },
  
  getActiveSubscriptions: () => {
    return Array.from(subscriptionManager.activeSubscriptions.keys());
  }
};

// Store in environment for access in other scripts
altair.helpers.setEnvironment('SUBSCRIPTION_MANAGER', JSON.stringify({
  active: subscriptionManager.getActiveSubscriptions()
}));
```

### Multi-Channel Subscription

```graphql
# Subscribe to multiple data streams
subscription MultiChannelUpdates($userId: ID!, $channels: [String!]!) {
  # User-specific updates
  userUpdates(userId: $userId) @include(if: "user" in $channels) {
    id
    type
    data
    timestamp
  }
  
  # System-wide notifications
  systemNotifications @include(if: "system" in $channels) {
    id
    type
    message
    priority
    timestamp
  }
  
  # Real-time metrics
  metrics @include(if: "metrics" in $channels) {
    activeUsers
    requestsPerSecond
    errorRate
    timestamp
  }
  
  # Chat messages (if user is in chat)
  chatMessages(userId: $userId) @include(if: "chat" in $channels) {
    id
    content
    author {
      id
      name
    }
    timestamp
  }
}
```

## Performance Optimization Patterns

### Query Optimization Scripts

```javascript
// Pre-request script for query optimization
const optimizeQuery = (query) => {
  const optimizations = [];
  
  // Check for potential N+1 patterns
  const nestedFields = query.match(/{\s*\w+\s*{\s*\w+\s*{/g);
  if (nestedFields && nestedFields.length > 3) {
    optimizations.push('Consider using fragments to reduce nesting depth');
  }
  
  // Check for missing pagination
  if (query.includes('posts') && !query.includes('first:') && !query.includes('limit:')) {
    optimizations.push('Consider adding pagination to posts query');
  }
  
  // Check for expensive fields without conditions
  const expensiveFields = ['aggregations', 'statistics', 'complexCalculation'];
  expensiveFields.forEach(field => {
    if (query.includes(field) && !query.includes('@include') && !query.includes('@skip')) {
      optimizations.push(`Consider making ${field} conditional with @include directive`);
    }
  });
  
  if (optimizations.length > 0) {
    console.warn('Query optimization suggestions:');
    optimizations.forEach((opt, index) => {
      console.warn(`${index + 1}. ${opt}`);
    });
  }
  
  return optimizations;
};

// Analyze current query
const currentQuery = altair.helpers.getCurrentQuery();
const suggestions = optimizeQuery(currentQuery);

// Store optimization data
altair.helpers.setEnvironment('QUERY_OPTIMIZATIONS', JSON.stringify(suggestions));
```

### Caching Strategy Implementation

```javascript
// Post-request script for response caching
const implementCaching = () => {
  const query = altair.data.query.query;
  const variables = altair.data.variables;
  const response = altair.data.response.body;
  
  // Create cache key
  const cacheKey = btoa(JSON.stringify({ query, variables }));
  
  // Cache configuration
  const cacheConfig = {
    'user': { ttl: 300000, key: 'user-cache' },        // 5 minutes
    'posts': { ttl: 60000, key: 'posts-cache' },       // 1 minute
    'comments': { ttl: 30000, key: 'comments-cache' }, // 30 seconds
    'statistics': { ttl: 600000, key: 'stats-cache' }  // 10 minutes
  };
  
  // Determine cache type based on query
  let cacheType = 'default';
  Object.keys(cacheConfig).forEach(type => {
    if (query.toLowerCase().includes(type)) {
      cacheType = type;
    }
  });
  
  const config = cacheConfig[cacheType] || { ttl: 300000, key: 'default-cache' };
  
  // Store in cache
  const cacheData = {
    response,
    timestamp: Date.now(),
    ttl: config.ttl,
    query,
    variables
  };
  
  let cache = JSON.parse(altair.helpers.getEnvironment(config.key) || '{}');
  cache[cacheKey] = cacheData;
  
  // Clean expired entries
  Object.keys(cache).forEach(key => {
    const entry = cache[key];
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete cache[key];
    }
  });
  
  altair.helpers.setEnvironment(config.key, JSON.stringify(cache));
  
  console.log(`Response cached with key: ${cacheKey} (TTL: ${config.ttl}ms)`);
};

// Only cache successful responses
if (altair.data.response.status === 200 && !altair.data.response.body.errors) {
  implementCaching();
}
```

These advanced usage patterns demonstrate how Altair can be extended far beyond basic GraphQL querying to become a comprehensive development and testing platform. By leveraging scripts, environment variables, and advanced GraphQL features, you can create sophisticated workflows that scale with your project's complexity.