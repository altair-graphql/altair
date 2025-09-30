---
parent: Features
---

# Query Pane

The query pane is the heart of Altair GraphQL Client where you write, edit, and execute your GraphQL queries, mutations, and subscriptions.

## Query Editor Features

### Syntax Highlighting

The query editor provides comprehensive syntax highlighting for GraphQL:

- **Keywords**: `query`, `mutation`, `subscription`, `fragment`
- **Types**: Built-in scalars, custom types, enums
- **Fields**: Query fields, arguments, and directives
- **Comments**: Both single-line `#` and block comments
- **Variables**: Variable definitions and usage

### Auto-completion

Intelligent auto-completion helps you write queries faster:

- **Field suggestions**: Based on your loaded schema
- **Argument completion**: Shows required and optional arguments
- **Type information**: Displays field types and descriptions
- **Fragment suggestions**: Available fragments in your query

To trigger auto-completion:
- Press `Ctrl + Space` (Windows/Linux) or `Cmd + Space` (macOS)
- Auto-completion appears as you type

### Schema-aware Validation

Real-time validation against your GraphQL schema:

- **Red underlines**: Syntax errors and schema violations
- **Warning indicators**: Deprecated fields and arguments
- **Type checking**: Ensures variables match expected types
- **Fragment validation**: Validates fragment usage and definitions

## Writing Queries

### Basic Query Structure

```graphql
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
```

### Using Fragments

Fragments help avoid repetition and maintain consistency:

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
    preferences {
      theme
      language
    }
  }
}
```

### Inline Fragments

For handling union types and interfaces:

```graphql
query GetSearchResults($query: String!) {
  search(query: $query) {
    ... on User {
      id
      name
      email
    }
    ... on Post {
      id
      title
      content
    }
    ... on Comment {
      id
      content
      author {
        name
      }
    }
  }
}
```

## Query Operations

### Multiple Operations

You can define multiple operations in a single query pane:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
  }
}

mutation UpdateUser($id: ID!, $input: UserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    updatedAt
  }
}

subscription UserUpdates($userId: ID!) {
  userUpdated(id: $userId) {
    id
    name
    lastSeen
  }
}
```

**Note**: When multiple operations exist, you'll need to select which one to execute using the operation selector dropdown.

### Operation Names

Always use descriptive operation names:

```graphql
# ✅ Good - descriptive and specific
query GetUserProfileWithPosts($userId: ID!) { ... }
mutation CreateNewBlogPost($input: PostInput!) { ... }
subscription ListenToCommentUpdates($postId: ID!) { ... }

# ❌ Avoid - generic and unclear
query GetData { ... }
mutation Update { ... }
subscription Listen { ... }
```

## Editor Shortcuts and Commands

### Keyboard Shortcuts

- **Execute Query**: `Ctrl/Cmd + Enter`
- **Prettify Query**: `Ctrl + Shift + P`
- **Comment/Uncomment**: `Ctrl/Cmd + /`
- **Find**: `Ctrl/Cmd + F` or `Alt + F`
- **Jump to Docs**: `Ctrl + D`
- **Fill All Fields**: `Ctrl + Shift + Enter`

### Additional Shortcuts

- **Toggle Variables**: `Ctrl + Shift + V`
- **Toggle Headers**: `Ctrl + Shift + H`
- **Toggle Docs**: `Ctrl + Shift + D`
- **Reload Schema**: `Ctrl + Shift + R`
- **Save Query**: `Cmd + S` (macOS)
- **New Window**: `Ctrl + T`
- **Close Window**: `Ctrl + W`
- **Reopen Window**: `Ctrl + Shift + T`

## Working with Variables

### Variable Panel

The variables panel (adjacent to the query pane) allows you to define dynamic values:

```json
{
  "userId": "123",
  "includeProfile": true,
  "limit": 10,
  "filters": {
    "status": "ACTIVE",
    "roles": ["USER", "ADMIN"]
  }
}
```

### Variable Types

Ensure your variables match the expected GraphQL types:

```graphql
query ExampleQuery(
  $stringVar: String!           # Required string
  $intVar: Int                  # Optional integer
  $boolVar: Boolean = false     # Boolean with default
  $enumVar: Status = ACTIVE     # Enum with default
  $inputVar: UserInput!         # Required input object
  $listVar: [String!]!          # Required list of required strings
) {
  # Query using variables...
}
```

### Environment Variables in Queries

Use environment variables within your queries:

```graphql
# This won't work - environment variables are not supported in query text
query GetUser {
  user(id: "{{USER_ID}}") {  # ❌ Not supported
    name
  }
}

# Instead, use GraphQL variables
query GetUser($userId: ID!) {
  user(id: $userId) {          # ✅ Correct approach
    name
  }
}
```

Then in the variables panel:
```json
{
  "userId": "{{USER_ID}}"     // Environment variable in variables panel
}
```

## Query Organization

### Comments and Documentation

Document your queries for better maintainability:

```graphql
"""
Retrieves user profile information including posts and preferences.
Used by: Profile page, Settings page
Performance: ~150ms average response time
Last updated: 2024-01-15
"""
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    # Basic user information
    id
    name
    email
    
    # Profile details
    profile {
      bio
      avatar
      # Social media links
      socialLinks {
        platform
        url
      }
    }
    
    # Recent activity (limited to last 10 items)
    posts(first: 10, orderBy: CREATED_AT_DESC) {
      id
      title
      createdAt
    }
  }
}
```

### Query Naming Conventions

Use consistent naming patterns:

```graphql
# Queries - noun-based names
query GetUserById($id: ID!) { ... }
query ListActiveUsers($limit: Int) { ... }
query SearchPostsByTitle($title: String!) { ... }

# Mutations - verb-based names
mutation CreateUser($input: CreateUserInput!) { ... }
mutation UpdateUserProfile($id: ID!, $input: ProfileInput!) { ... }
mutation DeletePost($id: ID!) { ... }

# Subscriptions - event-based names
subscription OnUserStatusChange($userId: ID!) { ... }
subscription OnNewMessage($chatId: ID!) { ... }
subscription OnSystemUpdates { ... }
```

## Advanced Query Techniques

### Conditional Fields

Use directives to conditionally include fields:

```graphql
query GetUser($id: ID!, $includeProfile: Boolean = false, $includePosts: Boolean = false) {
  user(id: $id) {
    id
    name
    email
    
    profile @include(if: $includeProfile) {
      bio
      avatar
    }
    
    posts @include(if: $includePosts) {
      id
      title
    }
  }
}
```

### Aliases for Multiple Calls

Query the same field with different arguments:

```graphql
query GetMultipleUsers {
  admin: user(id: "admin-123") {
    id
    name
    role
  }
  
  regularUser: user(id: "user-456") {
    id
    name
    role
  }
  
  recentUsers: users(first: 5, orderBy: CREATED_AT_DESC) {
    id
    name
    createdAt
  }
}
```

### Nested Fragments

Organize complex queries with nested fragments:

```graphql
fragment PostContent on Post {
  id
  title
  content
  createdAt
  ...PostAuthor
  ...PostComments
}

fragment PostAuthor on Post {
  author {
    id
    name
    avatar
  }
}

fragment PostComments on Post {
  comments(first: 3) {
    id
    content
    author {
      name
    }
  }
}

query GetPostWithDetails($postId: ID!) {
  post(id: $postId) {
    ...PostContent
  }
}
```

## Error Handling in Queries

### Handling Partial Errors

GraphQL can return partial data with errors:

```graphql
query GetUsersWithPosts {
  users {
    id
    name
    # This field might fail for some users
    posts {
      id
      title
    }
  }
}
```

### Error-prone Field Handling

For fields that might fail, consider making them optional:

```graphql
# Instead of required field that might fail
query RiskyQuery {
  user(id: $id) {
    id
    name
    expensiveCalculation  # Might timeout or fail
  }
}

# Use fragments to make it optional
query SaferQuery {
  user(id: $id) {
    id
    name
    ...ExpensiveData
  }
}

fragment ExpensiveData on User {
  expensiveCalculation
}
```

## Best Practices

### Query Structure
- Keep queries focused and specific to your use case
- Use descriptive operation names
- Limit query depth to avoid performance issues
- Request only the fields you actually need

### Performance
- Use pagination for large result sets
- Avoid deeply nested queries
- Consider query complexity limits
- Monitor response times using [response stats](/docs/features/response-stats)

### Maintainability
- Document complex queries with comments
- Use consistent naming conventions
- Extract reusable parts into fragments
- Keep variables organized and well-named

### Testing
- Test queries with various input combinations
- Verify error handling with invalid inputs
- Check performance with realistic data volumes
- Validate queries work across different environments

The query pane in Altair provides all the tools you need to efficiently write, test, and maintain your GraphQL operations. Combined with features like auto-completion, syntax highlighting, and real-time validation, it creates a powerful environment for GraphQL development.