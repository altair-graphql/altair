---
applyTo: '**/*.ts'
---

# Testing Instructions for Altair GraphQL Client app

This document provides guidelines for testing the Altair GraphQL Client app codebase, including how to run tests, write new tests, and ensure code quality.

## Running Tests

To run tests in the Altair GraphQL Client app, follow these steps:

1. **Install Dependencies**: Ensure you have all dependencies installed by running:
   ```bash
   pnpm install
   ```
2. **Run Tests**: Go to the `packages/altair-app` directory and use the following command to run all tests:
   ```bash
   pnpm jest
   ```
3. **Watch Mode**: To run tests in watch mode, which automatically re-runs tests when files change, use:
   ```bash
   pnpm jest -- --watch
   ```

## Writing Tests

When writing tests for the Altair GraphQL Client app, follow these guidelines:

1. **Use Jest**: The project uses Jest as the testing framework. Familiarize yourself with its [documentation](https://jestjs.io/docs/getting-started) for writing tests.
2. **Organize Tests**: Place tests in the same directory as the code they are testing, typically in a `__tests__` folder or alongside the source files with a `.test.ts` or `.spec.ts` suffix.
3. **Use Descriptive Names**: Write clear and descriptive test names that explain what the test is verifying.
4. **Mock Dependencies**: Use Jest's mocking capabilities to isolate the code being tested. This is especially important for testing components that rely on external services or APIs.
5. **Write Unit Tests**: Focus on writing unit tests for individual functions and components. Ensure that each test is independent and does not rely on the state of other tests.
6. **Integration Tests**: For testing interactions between multiple components or services, write integration tests that cover the flow of data and functionality.
7. **End-to-End Tests**: If applicable, write end-to-end tests to verify the complete functionality of the application from the user's perspective.
8. **Use TypeScript Types**: Leverage TypeScript's type system to ensure type safety in your tests. Use interfaces and types to define the expected structure of data.
9. **Follow Code Style**: Adhere to the project's coding standards and style guides. Use tools like ESLint and Prettier to maintain code quality.

### Testing Angular Components

For testing Angular components, follow these additional guidelines:

#### General Component Testing Guidelines

- The components are in `packages/altair-app/src/app/modules/altair/components`.
- The testing framework is custom made in `packages/altair-app/src/testing`, built on angular/core testing framework and jest for assertions.
- **Only write tests for the component's business logic**. Don't write tests for the component libraries we are using (e.g. ng-zorro, Angular Material).

#### What to Test

**✅ DO Test:**

- Component business logic and methods
- Event emissions using `wrapper.emitted()`
- State management and property changes
- Component lifecycle behavior
- Edge cases (null values, rapid calls, invalid inputs)
- Method return values and side effects
- Component interaction with services (mocked)

**❌ DON'T Test:**

- UI library component props (e.g. `nz-modal`, `nz-button` properties)
- Template rendering details
- Third-party library behavior
- Angular framework internals
- CSS styling or visual appearance

#### Testing Patterns

1. **Component Access**: Use `wrapper.componentInstance` to access component properties and methods:

   ```typescript
   const component = wrapper.componentInstance;
   component.someMethod();
   expect(component.someProperty).toBe(expectedValue);
   ```

2. **Event Testing**: Use `wrapper.emitted()` to test event emissions:

   ```typescript
   component.onSave();
   expect(wrapper.emitted().save).toBeTruthy();
   expect(wrapper.emitted().save[0]).toEqual([expectedData]);
   ```

3. **State Management**: Focus on testing how component state changes in response to actions:

   ```typescript
   expect(component.isVisible).toBe(false);
   component.show();
   expect(component.isVisible).toBe(true);
   ```

4. **Edge Cases**: Always test edge cases and error conditions:

   ```typescript
   // Test null/undefined inputs
   component.handleEvent(null);
   expect(component.errorState).toBe(false);

   // Test rapid successive calls
   component.toggle();
   component.toggle();
   expect(component.state).toBe('consistent');
   ```

#### Example Test File References

- `packages/altair-app/src/app/modules/altair/components/query-collection-item/query-collection-item.component.spec.ts`
- `packages/altair-app/src/app/modules/altair/components/action-bar/action-bar.component.spec.ts`
- `packages/altair-app/src/app/modules/altair/components/dialog/dialog.component.spec.ts`

These files demonstrate the proper focus on component business logic rather than UI library testing.

## Troubleshooting Common Issues

If you encounter issues while running tests or writing new tests, consider the following troubleshooting steps:

1. **Check Dependencies**: Ensure that all dependencies are correctly installed and up to date. Run `pnpm install` to install missing dependencies.
2. **Clear Cache**: If tests are failing unexpectedly, try clearing the Jest cache:
   ```bash
   pnpm jest --clearCache
   ```
3. **Check Test Configuration**: Ensure that your Jest configuration is correctly set up in the `jest.config.js` file. Verify that the test environment and paths are correctly defined.
4. **Review Error Messages**: Carefully read any error messages or stack traces provided by Jest. They often contain valuable information about what went wrong.
5. **Consult Documentation**: Refer to the [Jest documentation](https://jestjs.io/docs/getting-started) for additional troubleshooting tips and best practices.
