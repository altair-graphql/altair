---
applyTo: '**/*.ts'
---

# Testing Instructions for Altair App

## Custom Testing Framework

- Components are in `packages/altair-app/src/app/modules/altair/components`.
- The testing framework is custom built in `packages/altair-app/src/testing`, using Angular's core testing framework with Vitest for assertions.
- **Only write tests for the component's business logic**. Don't test component libraries (ng-zorro, Angular Material).

## What to Test

**DO Test:**

- Component business logic and methods
- Event emissions using `wrapper.emitted()`
- State management and property changes
- Component lifecycle behavior
- Edge cases (null values, rapid calls, invalid inputs)
- Method return values and side effects
- Component interaction with services (mocked)

**DON'T Test:**

- UI library component props (e.g. `nz-modal`, `nz-button` properties)
- Template rendering details
- Third-party library behavior
- Angular framework internals
- CSS styling or visual appearance

## Testing Patterns

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

3. **Test Isolation**: Each `it` block gets a fresh component instance via `beforeEach`. Avoid fragile emission index tracking across multiple actions in a single test:

   **FRAGILE - Don't do this:**

   ```typescript
   it('should handle multiple scenarios', () => {
     component.method1(); // Emits event at index 0
     component.method2(); // Emits event at index 1
     expect(wrapper.emitted('event')[1][0]).toBe(expected); // Brittle!
   });
   ```

   **ROBUST - Do this instead:**

   ```typescript
   describe('event scenarios', () => {
     it('should handle scenario 1', () => {
       component.method1();
       expect(wrapper.emitted('event')[0][0]).toBe(expected1);
     });

     it('should handle scenario 2', () => {
       component.method2();
       expect(wrapper.emitted('event')[0][0]).toBe(expected2);
     });
   });
   ```

## Example Test Files

- `packages/altair-app/src/app/modules/altair/components/query-collection-item/query-collection-item.component.spec.ts`
- `packages/altair-app/src/app/modules/altair/components/action-bar/action-bar.component.spec.ts`
- `packages/altair-app/src/app/modules/altair/components/dialog/dialog.component.spec.ts`

## Troubleshooting

- **Unexpected test failures**: Try deleting the `node_modules/.vite` cache directory.
- **Missing dependencies**: Run `pnpm install` from the monorepo root.
