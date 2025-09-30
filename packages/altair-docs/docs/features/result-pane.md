---
parent: Features
---

# Result Pane

The result pane displays the response from your GraphQL server, providing comprehensive information about query results, errors, and response metadata.

## Response Display Modes

### JSON View (Default)

The primary view shows responses in formatted JSON:

```json
{
  "data": {
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "profile": {
        "bio": "Software Developer",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  }
}
```

**Features of JSON View**:
- Syntax highlighting for different value types
- Collapsible objects and arrays
- Copy individual values or entire objects
- Search within response data

### Raw Response Mode

View the raw server response without formatting:
- Useful for debugging server output
- Shows exact response including whitespace
- Helpful for identifying formatting issues
- Access via result pane options menu

## Response Structure

### Successful Responses

A typical successful GraphQL response contains:

```json
{
  "data": {
    // Your requested data here
  },
  "extensions": {
    // Optional server-specific metadata
    "tracing": {
      "version": 1,
      "startTime": "2024-01-15T10:30:00.000Z",
      "endTime": "2024-01-15T10:30:00.150Z",
      "duration": 150000000
    }
  }
}
```

### Error Responses

Responses with errors include an `errors` array:

```json
{
  "data": {
    "user": null  // Partial data may still be present
  },
  "errors": [
    {
      "message": "User not found",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["user"],
      "extensions": {
        "code": "USER_NOT_FOUND",
        "exception": {
          "stacktrace": ["Error: User not found", "    at UserResolver.getUser..."]
        }
      }
    }
  ]
}
```

### Partial Success Responses

GraphQL can return partial data with errors:

```json
{
  "data": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "posts": [
          {"id": "post1", "title": "Hello World"}
        ]
      },
      {
        "id": "2", 
        "name": "Jane Smith",
        "posts": null  // This field failed
      }
    ]
  },
  "errors": [
    {
      "message": "Failed to load posts for user 2",
      "path": ["users", 1, "posts"]
    }
  ]
}
```

## Response Metadata

### Response Statistics

At the bottom of the result pane, you'll see:

```
Status: 200 OK | Time: 245ms | Size: 1.2KB
```

- **Status**: HTTP status code and message
- **Time**: Total response time including network latency
- **Size**: Response payload size

### Response Headers

View HTTP response headers by clicking the headers tab:

```
content-type: application/json
content-length: 1234
cache-control: no-cache
x-response-time: 245ms
x-request-id: req_abc123
```

## Working with Response Data

### Copying Data

**Copy Specific Values**:
- Select text in the response to copy it
- Use standard copy keyboard shortcuts (Ctrl/Cmd+C)

**Copy Entire Response**:
- Select all text in the result pane (Ctrl/Cmd+A)
- Copy with Ctrl/Cmd+C
- Or download the response (see Downloading section below)

### Searching Response Data

Use browser's find functionality to search response data:

1. Use Ctrl/Cmd+F to open find in the result pane
2. Enter your search term
3. Navigate through results with Enter or find navigation buttons

### Navigating Large Responses

**For complex nested responses**:
- Click to expand/collapse objects and arrays
- Use breadcrumb navigation for deep structures
- Utilize the minimap for large responses
- Set display limits in settings for performance

## Error Analysis

### Understanding GraphQL Errors

**Error Components**:
- **Message**: Human-readable error description
- **Path**: Array showing where in the query the error occurred
- **Locations**: Line and column numbers in your query
- **Extensions**: Additional error metadata (error codes, stack traces)

**Example Error Analysis**:
```json
{
  "errors": [
    {
      "message": "Variable '$userId' of type 'ID!' was provided invalid value",
      "locations": [{"line": 1, "column": 24}],
      "extensions": {
        "code": "BAD_USER_INPUT",
        "exception": {
          "stacktrace": ["GraphQLError: Variable '$userId'..."]
        }
      }
    }
  ]
}
```

This error tells you:
- The variable `$userId` has an invalid value
- It's expected to be of type `ID!` (required ID)
- The error occurs at line 1, column 24 in your query
- The error code is `BAD_USER_INPUT`

### Common Error Types

**Validation Errors**:
```json
{
  "errors": [
    {
      "message": "Cannot query field 'invalidField' on type 'User'",
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED"
      }
    }
  ]
}
```

**Authentication Errors**:
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**Server Errors**:
```json
{
  "errors": [
    {
      "message": "Internal server error",
      "extensions": {
        "code": "INTERNAL_ERROR",
        "exception": {
          "stacktrace": ["Error: Database connection failed..."]
        }
      }
    }
  ]
}
```

## Response Actions

### Download Response

Save response data to your local machine:

1. Click the download button in result pane toolbar
2. The response will be downloaded as a JSON file

### Clear Response

Remove response data from the pane:
- Useful for large responses that slow down the interface
- Helps distinguish new responses from cached ones
- Click the clear button or use keyboard shortcut

### Share Response

Share response data with team members:
- Copy permalink to response (if supported)
- Export response data
- Screenshot response with annotations

## Response Formatting

### Pretty Print

Automatic JSON formatting with:
- Proper indentation (2 or 4 spaces, configurable)
- Syntax highlighting
- Expandable/collapsible sections

### Custom Formatting

Configure response display in Settings:
- **Indentation**: Spaces or tabs, size preference
- **Theme**: Light/dark mode for better readability
- **Font**: Size and family preferences
- **Line Numbers**: Show/hide line numbers

## Working with Different Response Types

### Subscription Responses

Real-time subscription data appears as streaming updates:

```json
// First message
{"data": {"messageAdded": {"id": "1", "text": "Hello"}}}

// Second message  
{"data": {"messageAdded": {"id": "2", "text": "World"}}}

// Connection status
{"type": "connection_ack"}
```

### File Upload Responses

Responses from file upload mutations:

```json
{
  "data": {
    "uploadFile": {
      "id": "file_123",
      "filename": "document.pdf",
      "size": 1024000,
      "url": "https://storage.example.com/files/document.pdf"
    }
  }
}
```

### Batch Query Responses

Responses from batched queries (array format):

```json
[
  {
    "data": {"user": {"id": "1", "name": "John"}}
  },
  {
    "data": {"user": {"id": "2", "name": "Jane"}}
  }
]
```

## Performance Considerations

### Large Response Handling

For large responses (>1MB):
- Enable response streaming in settings
- Set display limits to prevent browser slowdown
- Consider pagination in your queries
- Use response filtering to show only relevant data

### Memory Management

Optimize Altair performance:
- Clear responses regularly for large datasets
- Limit query history depth
- Close unused query windows
- Use response compression when available

## Advanced Features

### Response Comparison

Compare responses from different queries or environments:
1. Execute first query and save response
2. Execute second query
3. Use comparison tool to highlight differences
4. Useful for testing API changes or debugging

### Response Validation

Validate responses against expected schema:
- Set up response validation rules
- Check for required fields
- Verify data types and formats
- Useful for API testing and quality assurance

### Custom Response Processing

Use post-request scripts to process responses:

```javascript
// Post-request script example
const response = altair.data.response.body;

if (response.data && response.data.users) {
  const userCount = response.data.users.length;
  console.log(`Retrieved ${userCount} users`);
  
  // Process each user
  response.data.users.forEach(user => {
    if (!user.email) {
      console.warn(`User ${user.id} missing email`);
    }
  });
}

// Store processed data
altair.helpers.setEnvironment('LAST_USER_COUNT', userCount.toString());
```

## Best Practices

### Response Analysis
- Always check both `data` and `errors` fields
- Pay attention to null values in partial responses
- Use error paths to locate issues in complex queries
- Monitor response times for performance optimization

### Data Handling
- Don't rely on response structure alone - validate data
- Handle null values gracefully in your applications
- Consider pagination for large datasets
- Use appropriate data types based on GraphQL schema

### Debugging
- Use response headers for debugging server behavior
- Check error extensions for detailed error information
- Compare responses across different environments
- Save successful responses as reference examples

The result pane is your window into GraphQL API responses, providing comprehensive tools for analyzing, debugging, and working with your query results effectively.