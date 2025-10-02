---
applyTo: '**/*.ts'
---

# TypeScript Development Instructions for Altair GraphQL Client

These instructions provide general TypeScript development guidelines for all packages in the Altair monorepo.

## Code Style and Conventions

### Type Definitions
- Use explicit type annotations for function parameters and return types
- Prefer interfaces over type aliases for object shapes
- Use union types and literal types for better type safety
- Leverage generic types for reusable components

```typescript
interface QueryState {
  query: string;
  variables: Record<string, unknown>;
  headers: HeaderState[];
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function processQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  // Implementation
}
```

### Imports and Exports
- Group imports: external libraries, then internal modules
- Use absolute imports from package roots when possible
- Prefer named exports over default exports for better IDE support

```typescript
// External imports
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

// Internal imports
import { QueryState } from '../types/state.interfaces';
import { formatQuery } from '../utils/query-formatter';
```

### Error Handling
- Use custom error classes that extend Error
- Implement proper error boundaries and handling
- Log errors with sufficient context for debugging

```typescript
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Async Patterns

### Observables (RxJS)
- Use observables for reactive programming patterns
- Implement proper subscription management to avoid memory leaks
- Use appropriate RxJS operators for data transformation
- Handle errors in observable streams

### Promises and Async/Await
- Use async/await for better readability in sequential operations
- Handle promise rejections properly
- Use Promise.all() for concurrent operations
- Implement timeout handling for long-running operations

## Testing Patterns

### Unit Tests
- Write tests that focus on business logic and behavior
- Use descriptive test names that explain what is being tested
- Mock external dependencies appropriately
- Test edge cases and error conditions

```typescript
describe('QueryFormatter', () => {
  it('should format GraphQL query with proper indentation', () => {
    const input = 'query{user{id name}}';
    const expected = `query {
  user {
    id
    name
  }
}`;
    expect(formatQuery(input)).toBe(expected);
  });

  it('should handle malformed queries gracefully', () => {
    const input = 'invalid query';
    expect(() => formatQuery(input)).toThrow(ValidationError);
  });
});
```

## Performance Considerations

### Memory Management
- Dispose of resources properly (subscriptions, event listeners)
- Use weak references where appropriate
- Avoid creating unnecessary objects in hot paths
- Profile memory usage for performance-critical code

### Bundle Size
- Use tree shaking friendly imports
- Lazy load heavy modules when possible
- Monitor bundle size impacts of new dependencies
- Use dynamic imports for code splitting

## Security

### Input Validation
- Validate and sanitize all user inputs
- Use TypeScript's strict mode for better type safety
- Implement proper XSS and injection prevention
- Validate API responses before processing

### Sensitive Data
- Never commit secrets or API keys to version control
- Use environment variables for configuration
- Implement proper data sanitization in logs
- Follow secure coding practices

## Code Organization

### File Structure
- Group related functionality in modules
- Keep files focused and not too large
- Use consistent naming conventions
- Organize imports and exports clearly

### Documentation
- Write JSDoc comments for public APIs
- Include examples in documentation
- Keep documentation up to date with code changes
- Use meaningful variable and function names

## Compatibility

### Node.js and Browser
- Write code that works in both Node.js and browser environments when needed
- Use appropriate polyfills for missing features
- Test compatibility across different environments
- Handle environment-specific APIs properly

### TypeScript Version
- Use TypeScript features appropriate for the configured version
- Keep TypeScript configuration consistent across packages
- Update TypeScript incrementally and test thoroughly
- Use strict TypeScript settings for better type safety