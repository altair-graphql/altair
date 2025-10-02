---
applyTo: '**/*.{test,spec}.{ts,js}'
---

# Testing Instructions for Altair GraphQL Client

These instructions provide comprehensive testing guidelines for all packages in the Altair monorepo.

> **Note:** For Angular app-specific testing guidelines, see [app-testing.instructions.md](./app-testing.instructions.md) which covers the custom testing framework in `packages/altair-app/src/testing`.

## General Testing Principles

### Test Structure
- Follow the Arrange-Act-Assert (AAA) pattern
- Write descriptive test names that explain the expected behavior
- Keep tests focused and independent
- Use consistent naming conventions across all test files

```typescript
describe('QueryFormatter', () => {
  describe('format', () => {
    it('should properly indent nested GraphQL queries', () => {
      // Arrange
      const input = 'query{user{id name}}';
      const expected = `query {
  user {
    id
    name
  }
}`;

      // Act
      const result = formatQuery(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle empty queries gracefully', () => {
      // Arrange
      const input = '';

      // Act & Assert
      expect(() => formatQuery(input)).toThrow('Query cannot be empty');
    });
  });
});
```

### Test Organization
- Group related tests using `describe` blocks
- Use nested `describe` blocks for different methods or scenarios
- Place setup code in `beforeEach` or `beforeAll` hooks
- Clean up resources in `afterEach` or `afterAll` hooks

## Unit Testing

### Mocking Dependencies
- Mock external dependencies to isolate units under test
- Use Jest's mocking capabilities effectively
- Create reusable mock factories for common dependencies
- Verify interactions with mocked dependencies when necessary

```typescript
jest.mock('../services/api.service');

describe('UserController', () => {
  let controller: UserController;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(() => {
    mockApiService = {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    } as jest.Mocked<ApiService>;

    controller = new UserController(mockApiService);
  });

  it('should call ApiService.getUser with correct parameters', async () => {
    // Arrange
    const userId = '123';
    mockApiService.getUser.mockResolvedValue({ id: userId, name: 'John' });

    // Act
    await controller.getUser(userId);

    // Assert
    expect(mockApiService.getUser).toHaveBeenCalledWith(userId);
  });
});
```

### Testing Async Code
- Use async/await for testing promises
- Test both success and error scenarios
- Handle timeouts appropriately
- Test concurrent operations when relevant

```typescript
it('should handle API errors gracefully', async () => {
  // Arrange
  const error = new Error('API Error');
  mockApiService.getUser.mockRejectedValue(error);

  // Act & Assert
  await expect(controller.getUser('123')).rejects.toThrow('API Error');
});
```

## Angular Component Testing

### Component Test Setup
- Use the custom testing framework in `packages/altair-app/src/testing`
- Focus on component business logic rather than UI library behavior
- Mock services and external dependencies
- Test component lifecycle methods appropriately

```typescript
import { mount } from 'src/testing';
import { ExampleComponent } from './example.component';

describe('ExampleComponent', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(ExampleComponent, {
      props: {
        initialValue: 'test'
      },
      providers: [
        { provide: SomeService, useValue: mockSomeService }
      ]
    });
  });

  it('should emit event when button is clicked', () => {
    // Act
    wrapper.componentInstance.onButtonClick();

    // Assert
    expect(wrapper.emitted().buttonClicked).toBeTruthy();
    expect(wrapper.emitted().buttonClicked[0]).toEqual(['test-data']);
  });
});
```

### What to Test in Components
- Component methods and business logic
- Event emissions and their payloads
- State changes and property updates
- Component lifecycle behavior
- Integration with injected services (mocked)

### What NOT to Test in Components
- UI library component properties (ng-zorro, Angular Material)
- Template rendering details
- CSS styling and visual appearance
- Third-party library behavior

## NestJS API Testing

### Controller Testing
- Test HTTP request handling and response formatting
- Mock service dependencies
- Test authentication and authorization
- Verify error handling and status codes

```typescript
describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useFactory: () => ({
            findAll: jest.fn(),
            create: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });
});
```

### Service Testing
- Test business logic and data transformations
- Mock repository/database interactions
- Test error handling and validation
- Verify logging and monitoring calls

### Integration Testing
- Test API endpoints end-to-end
- Use test databases or database transactions
- Test authentication flows
- Verify API contracts and responses

## Browser Extension Testing

### Extension-Specific Testing
- Mock browser APIs (chrome.*, browser.*)
- Test message passing between components
- Test content script interactions
- Verify manifest configuration

```typescript
// Mock chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
  },
};

global.chrome = mockChrome;
```

## Performance Testing

### Performance Benchmarks
- Write performance tests for critical code paths
- Set performance budgets and thresholds
- Monitor test execution times
- Profile memory usage in tests

### Load Testing
- Test API endpoints under load
- Verify graceful degradation
- Test resource cleanup and memory leaks
- Monitor performance metrics

## End-to-End Testing

### E2E Test Strategy
- Focus on critical user journeys
- Use realistic test data and scenarios
- Test cross-browser compatibility
- Verify integrations between components

### Test Environment Setup
- Use dedicated test environments
- Mock external services appropriately
- Ensure test data consistency
- Clean up test artifacts

## Test Data Management

### Test Fixtures
- Create reusable test data factories
- Use realistic but anonymized data
- Version test fixtures with code changes
- Clean up test data after tests

```typescript
const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});
```

## Coverage and Quality

### Code Coverage
- Maintain high test coverage (aim for >80%)
- Focus on testing critical business logic
- Use coverage reports to identify untested code
- Don't write tests just for coverage metrics

### Test Quality
- Review test code as carefully as production code
- Refactor tests to improve maintainability
- Remove flaky or unreliable tests
- Keep tests simple and focused

## Continuous Integration

### CI Test Strategy
- Run tests in multiple environments
- Parallelize test execution when possible
- Cache dependencies and test artifacts
- Fail fast on test failures

### Test Reporting
- Generate clear test reports
- Track test metrics over time
- Report flaky tests and failures
- Integrate with code quality tools