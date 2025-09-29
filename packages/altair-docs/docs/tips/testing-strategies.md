---
parent: Tips
---

# Testing Strategies with Altair

Learn how to leverage Altair GraphQL Client for comprehensive testing of your GraphQL APIs, from development to production.

## Testing Methodologies

### 1. Development Testing

**Interactive Query Development**:
Use Altair to prototype and validate queries before implementing them in your application:

```graphql
# Start with basic query structure
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
  }
}

# Gradually add complexity
query GetUserWithPosts($id: ID!, $includeComments: Boolean = false) {
  user(id: $id) {
    id
    name
    email
    posts(first: 10) {
      id
      title
      content
      comments @include(if: $includeComments) {
        id
        content
        author {
          name
        }
      }
    }
  }
}
```

**Schema Validation Testing**:
Test schema changes and backwards compatibility:

```graphql
# Test deprecated fields
query TestDeprecatedFields {
  user(id: "123") {
    id
    name
    oldField @deprecated  # Should show deprecation warning
    newField              # New field to replace deprecated one
  }
}

# Test new optional fields
query TestOptionalFields {
  user(id: "123") {
    id
    name
    newOptionalField     # Should work even if not implemented yet
  }
}
```

### 2. Integration Testing

**End-to-End Query Testing**:
Create comprehensive test collections for different user flows:

```graphql
# Collection: User Registration Flow

# Step 1: Register new user
mutation RegisterUser($input: RegisterInput!) {
  register(input: $input) {
    user {
      id
      email
      isVerified
    }
    token
  }
}

# Step 2: Verify email
mutation VerifyEmail($token: String!) {
  verifyEmail(token: $token) {
    success
    user {
      id
      isVerified
    }
  }
}

# Step 3: Complete profile
mutation CompleteProfile($userId: ID!, $profile: ProfileInput!) {
  updateUserProfile(userId: $userId, profile: $profile) {
    id
    profile {
      firstName
      lastName
      bio
    }
  }
}

# Step 4: Verify complete flow
query GetCompleteUser($id: ID!) {
  user(id: $id) {
    id
    email
    isVerified
    profile {
      firstName
      lastName
      bio
    }
  }
}
```

### 3. API Contract Testing

**Schema Introspection Testing**:
Verify your API exposes the expected schema:

```graphql
# Test available types
query GetAllTypes {
  __schema {
    types {
      name
      kind
      description
    }
  }
}

# Test specific type structure
query GetUserType {
  __type(name: "User") {
    name
    kind
    fields {
      name
      type {
        name
        kind
      }
      isDeprecated
      deprecationReason
    }
  }
}

# Test enum values
query GetStatusEnum {
  __type(name: "UserStatus") {
    name
    enumValues {
      name
      description
      isDeprecated
    }
  }
}
```

## Automated Testing Integration

### 1. Export Queries for Tests

Use Altair to develop queries, then export them for automated tests:

```javascript
// tests/graphql/user.test.js
const { gql } = require('apollo-server-testing');

// Exported from Altair collection
const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
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

describe('User Queries', () => {
  it('should return user data', async () => {
    const { query } = createTestClient(server);
    
    const res = await query({
      query: GET_USER_QUERY,
      variables: { id: 'user-123' }
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.user).toMatchObject({
      id: 'user-123',
      name: expect.any(String),
      email: expect.stringMatching(/\S+@\S+\.\S+/),
    });
  });
});
```

### 2. Collection-to-Test Conversion

Script to convert Altair collections to test files:

```javascript
// scripts/collection-to-tests.js
const fs = require('fs');
const path = require('path');

function generateTestsFromCollection(collection) {
  const testTemplate = `
const { gql } = require('apollo-server-testing');
const { createTestClient } = require('../test-utils');

describe('${collection.name}', () => {
${collection.queries.map(query => `
  it('should execute ${query.name}', async () => {
    const { query: executeQuery } = createTestClient(server);
    
    const QUERY = gql\`${query.query}\`;
    
    const variables = ${JSON.stringify(query.variables || {}, null, 6)};
    
    const result = await executeQuery({
      query: QUERY,
      variables
    });
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    
    // Add specific assertions based on your requirements
    // expect(result.data.${getFirstQueryField(query.query)}).toBeDefined();
  });
`).join('')}
});
`;

  return testTemplate;
}

function getFirstQueryField(queryString) {
  const match = queryString.match(/{\s*(\w+)/);
  return match ? match[1] : 'result';
}

// Usage: node scripts/collection-to-tests.js collection.json
const collectionFile = process.argv[2];
if (collectionFile) {
  const collection = JSON.parse(fs.readFileSync(collectionFile, 'utf8'));
  const testCode = generateTestsFromCollection(collection);
  
  const outputFile = path.join('tests', `${collection.name.toLowerCase()}.test.js`);
  fs.writeFileSync(outputFile, testCode);
  console.log(`Generated test file: ${outputFile}`);
}
```

## Performance Testing

### 1. Response Time Monitoring

Use scripts to track and alert on performance:

```javascript
// Pre-request script for performance baseline
const testStartTime = performance.now();
altair.helpers.setEnvironment('TEST_START_TIME', testStartTime);

// Post-request script for performance analysis
const startTime = parseFloat(altair.helpers.getEnvironment('TEST_START_TIME'));
const endTime = performance.now();
const responseTime = altair.data.response.responseTime;

const performanceData = {
  queryName: altair.data.query.operationName || 'Anonymous',
  clientTime: endTime - startTime,
  serverTime: responseTime,
  timestamp: new Date().toISOString(),
  environment: altair.helpers.getEnvironment('ENVIRONMENT') || 'development'
};

// Performance thresholds
const THRESHOLDS = {
  fast: 200,      // < 200ms is fast
  acceptable: 1000, // < 1s is acceptable
  slow: 3000      // > 3s is slow
};

let status = 'fast';
if (responseTime > THRESHOLDS.slow) {
  status = 'slow';
  console.error(`🐌 SLOW QUERY: ${performanceData.queryName} took ${responseTime}ms`);
} else if (responseTime > THRESHOLDS.acceptable) {
  status = 'acceptable';
  console.warn(`⚠️ SLOW-ISH QUERY: ${performanceData.queryName} took ${responseTime}ms`);
} else {
  console.log(`✅ FAST QUERY: ${performanceData.queryName} took ${responseTime}ms`);
}

performanceData.status = status;

// Store performance data for analysis
const perfLog = JSON.parse(altair.helpers.getEnvironment('PERFORMANCE_LOG') || '[]');
perfLog.push(performanceData);

// Keep only last 100 entries
if (perfLog.length > 100) {
  perfLog.shift();
}

altair.helpers.setEnvironment('PERFORMANCE_LOG', JSON.stringify(perfLog));
```

### 2. Load Testing Preparation

Use Altair to prepare queries for load testing:

```graphql
# Collection: Load Test Scenarios

# Scenario 1: High-frequency read operations
query QuickUserLookup($id: ID!) {
  user(id: $id) {
    id
    name
    status
  }
}

# Scenario 2: Complex nested queries
query ComplexUserData($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts(first: 20) {
      id
      title
      comments(first: 5) {
        id
        content
        author {
          name
        }
      }
    }
    followers(first: 10) {
      id
      name
    }
  }
}

# Scenario 3: Write operations
mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    id
    title
    content
    author {
      id
      name
    }
  }
}
```

### 3. Stress Testing Queries

```javascript
// Post-request script for stress testing metrics
const response = altair.data.response;
const metrics = {
  responseTime: response.responseTime,
  statusCode: response.status,
  hasErrors: !!(response.body.errors && response.body.errors.length > 0),
  dataSize: JSON.stringify(response.body).length,
  timestamp: Date.now()
};

// Track success/failure rates
let testResults = JSON.parse(altair.helpers.getEnvironment('STRESS_TEST_RESULTS') || '{"total": 0, "success": 0, "errors": 0}');

testResults.total++;
if (metrics.statusCode >= 200 && metrics.statusCode < 300 && !metrics.hasErrors) {
  testResults.success++;
} else {
  testResults.errors++;
}

const successRate = (testResults.success / testResults.total) * 100;
const errorRate = (testResults.errors / testResults.total) * 100;

console.log(`Stress Test Progress: ${testResults.total} requests, ${successRate.toFixed(1)}% success rate`);

if (errorRate > 5) { // Alert if error rate exceeds 5%
  console.warn(`🚨 HIGH ERROR RATE: ${errorRate.toFixed(1)}%`);
}

altair.helpers.setEnvironment('STRESS_TEST_RESULTS', JSON.stringify(testResults));
```

## Error Testing Strategies

### 1. Negative Testing

Test error conditions systematically:

```graphql
# Collection: Error Scenarios

# Test 1: Invalid user ID
query InvalidUserQuery {
  user(id: "invalid-id-12345") {
    id
    name
    email
  }
}

# Test 2: Unauthorized access
query UnauthorizedQuery {
  adminUsers {  # Requires admin role
    id
    email
    role
  }
}

# Test 3: Malformed input
mutation InvalidInput {
  createUser(input: {
    email: "not-an-email"    # Invalid email format
    age: -5                  # Invalid age
  }) {
    id
    email
  }
}

# Test 4: Missing required fields
mutation MissingRequiredFields {
  createPost(input: {
    # Missing required 'title' field
    content: "This post has no title"
  }) {
    id
    title
  }
}
```

### 2. Error Response Validation

```javascript
// Post-request script for error validation
const response = altair.data.response.body;

if (response.errors) {
  console.group('Error Analysis:');
  
  response.errors.forEach((error, index) => {
    console.log(`Error ${index + 1}:`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Code: ${error.extensions?.code || 'Unknown'}`);
    console.log(`  Path: ${error.path ? error.path.join(' → ') : 'N/A'}`);
    
    // Validate error structure
    const expectedErrorFields = ['message', 'locations', 'path'];
    const missingFields = expectedErrorFields.filter(field => !(field in error));
    
    if (missingFields.length > 0) {
      console.warn(`  Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check for proper error codes
    if (!error.extensions?.code) {
      console.warn('  Missing error code in extensions');
    }
  });
  
  console.groupEnd();
  
  // Track error types
  const errorTypes = response.errors.map(e => e.extensions?.code || 'UNKNOWN');
  console.log('Error types encountered:', errorTypes);
}
```

## Security Testing

### 1. Authentication Testing

```graphql
# Collection: Authentication Tests

# Test 1: Access without token
query UnauthenticatedAccess {
  me {
    id
    email
    privateData
  }
}

# Test 2: Access with expired token
query ExpiredTokenAccess {
  me {
    id
    email
  }
}

# Test 3: Access with invalid token
query InvalidTokenAccess {
  me {
    id
    email
  }
}

# Test 4: Role-based access
query AdminOnlyAccess {
  adminUsers {
    id
    email
    role
  }
}
```

### 2. Input Validation Testing

```graphql
# Collection: Input Validation Tests

# Test SQL injection patterns (should be blocked)
mutation SQLInjectionTest {
  createUser(input: {
    name: "'; DROP TABLE users; --"
    email: "test@example.com"
  }) {
    id
    name
  }
}

# Test XSS patterns (should be sanitized)
mutation XSSTest {
  createPost(input: {
    title: "<script>alert('xss')</script>"
    content: "Normal content"
  }) {
    id
    title
  }
}

# Test data size limits
mutation LargeDataTest {
  createPost(input: {
    title: "Normal title"
    content: $largeContent  # Very large string to test limits
  }) {
    id
    title
  }
}
```

## Regression Testing

### 1. Baseline Collection

Maintain a collection of queries that should always work:

```graphql
# Collection: Regression Test Suite

# Core functionality that must always work
query HealthCheck {
  __schema {
    queryType {
      name
    }
  }
}

query BasicUserQuery {
  users(first: 1) {
    id
    name
    email
  }
}

mutation BasicUserCreation($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}

subscription BasicSubscription {
  userUpdated {
    id
    name
    lastSeen
  }
}
```

### 2. Automated Regression Testing

```javascript
// Pre-request script for regression testing
const testSuite = 'regression-test-suite';
const testStartTime = Date.now();

altair.helpers.setEnvironment('REGRESSION_TEST_START', testStartTime);
altair.helpers.setEnvironment('CURRENT_TEST_SUITE', testSuite);

// Post-request script
const testStart = parseInt(altair.helpers.getEnvironment('REGRESSION_TEST_START'));
const duration = Date.now() - testStart;
const testSuite = altair.helpers.getEnvironment('CURRENT_TEST_SUITE');

const testResult = {
  suite: testSuite,
  query: altair.data.query.operationName || 'Anonymous',
  success: !altair.data.response.body.errors,
  duration: duration,
  timestamp: new Date().toISOString(),
  errors: altair.data.response.body.errors || []
};

// Store test results
let regressionResults = JSON.parse(altair.helpers.getEnvironment('REGRESSION_RESULTS') || '[]');
regressionResults.push(testResult);

altair.helpers.setEnvironment('REGRESSION_RESULTS', JSON.stringify(regressionResults));

// Log result
if (testResult.success) {
  console.log(`✅ REGRESSION TEST PASSED: ${testResult.query} (${duration}ms)`);
} else {
  console.error(`❌ REGRESSION TEST FAILED: ${testResult.query}`);
  console.error('Errors:', testResult.errors);
}
```

## Test Documentation and Reporting

### 1. Test Case Documentation

```graphql
"""
Test Case: User Profile Retrieval
Purpose: Verify that user profile data can be retrieved correctly
Prerequisites: User with ID 'test-user-123' must exist
Expected Result: Returns user with profile data
Performance Target: < 200ms response time
Author: @username
Last Updated: 2024-01-15
"""
query TestUserProfileRetrieval {
  user(id: "test-user-123") {
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

### 2. Test Report Generation

```javascript
// Generate test report from stored results
const generateTestReport = () => {
  const results = JSON.parse(altair.helpers.getEnvironment('REGRESSION_RESULTS') || '[]');
  
  const summary = {
    totalTests: results.length,
    passed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    averageDuration: results.reduce((acc, r) => acc + r.duration, 0) / results.length,
    testSuites: [...new Set(results.map(r => r.suite))]
  };
  
  console.log('=== Test Report ===');
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passed} (${(summary.passed/summary.totalTests*100).toFixed(1)}%)`);
  console.log(`Failed: ${summary.failed} (${(summary.failed/summary.totalTests*100).toFixed(1)}%)`);
  console.log(`Average Duration: ${summary.averageDuration.toFixed(2)}ms`);
  console.log(`Test Suites: ${summary.testSuites.join(', ')}`);
  
  if (summary.failed > 0) {
    console.log('\n=== Failed Tests ===');
    results.filter(r => !r.success).forEach(test => {
      console.log(`❌ ${test.query} (${test.suite})`);
      test.errors.forEach(error => {
        console.log(`   Error: ${error.message}`);
      });
    });
  }
  
  return summary;
};

// Run report generation
generateTestReport();
```

## Best Practices for Testing

### Test Organization
- Group related tests into collections
- Use descriptive names for queries and collections
- Document test purposes and expectations
- Maintain separate collections for different test types

### Test Data Management
- Use consistent test data across environments
- Document test data requirements
- Clean up test data after tests when necessary
- Use environment variables for test configuration

### Automation Integration
- Export stable queries to automated test suites
- Use Altair for exploratory testing, automation for regression
- Maintain test queries in version control
- Regular sync between Altair collections and automated tests

### Performance Considerations
- Set realistic performance benchmarks  
- Monitor performance trends over time
- Test with realistic data volumes
- Consider network conditions in performance testing

By leveraging Altair's powerful features for testing, you can build comprehensive test strategies that catch issues early and ensure your GraphQL APIs remain reliable and performant.