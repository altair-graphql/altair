# AGENTS.md - Altair GraphQL Client

## Repository Overview

Altair GraphQL Client is a monorepo managed with **pnpm** and **Nx/Turbo**. Key packages:

- `packages/altair-app` - Angular-based frontend application
- `packages/altair-api` - NestJS backend API
- `packages/altair-core` - Shared business logic and types
- `packages/altair-electron` - Electron desktop wrapper
- `packages/altair-crx` - Browser extension

## Build Commands

### Root Level (monorepo)

```bash
pnpm install              # Install all dependencies
pnpm bootstrap            # Build local packages and link them
pnpm build                # Build all packages
pnpm test                 # Run tests across monorepo
pnpm start:app            # Start web app (localhost:4200)
pnpm start:api:dev        # Start API dev server
pnpm build-ext            # Build browser extension
pnpm build-electron       # Build Electron app
```

### Altair App (packages/altair-app)

```bash
pnpm vitest run                            # Run all Vitest tests
pnpm vitest                                # Watch mode
pnpm vitest run path/to/file.spec.ts       # Run single test file
pnpm vitest run -t "name"                  # Run tests matching name
pnpm test-single-run                       # Single run with coverage
pnpm lint                                  # Run ESLint (ng lint)
pnpm build                                 # Build the app
```

> **Note:** Always run from the `packages/altair-app` directory. The test suite has 135 suites / ~1133 tests and takes ~3–4 minutes.

## Code Style

### Imports

Group imports in this order:
1. External libraries (rxjs, @angular/*)
2. Internal packages (@altairgraphql/*)
3. Relative imports (../, ./)

### Angular Components

- Use **OnPush change detection** strategy
- Use **signal inputs** (`input<T>()`) and **signal outputs** (`output<T>()`)
- Manage subscriptions (unsubscribe in ngOnDestroy)

### Angular Services

- Return **observables** from data methods
- Use **selectors** for NgRx state access
- Dispatch **actions** for state modifications

## Testing Guidelines

### What to Test
- Component **business logic** and methods
- **Event emissions** using `wrapper.emitted()`
- **State management** and property changes
- **Edge cases** (null values, rapid calls, invalid inputs)

### What NOT to Test
- UI library component props (ng-zorro, Angular Material)
- Template rendering details or CSS styling

### Test Pattern (altair-app)

```typescript
import { mount } from '../testing';
import { ExampleComponent } from './example.component';

describe('ExampleComponent', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(ExampleComponent, {
      props: { initialValue: 'test' },
      providers: [{ provide: SomeService, useValue: mockSomeService }]
    });
  });

  it('should emit event when button is clicked', () => {
    wrapper.componentInstance.onButtonClick();
    expect(wrapper.emitted().buttonClicked[0]).toEqual(['test-data']);
  });
});
```

### Test Independence

Each test should be independent. Avoid tracking emission indices across tests.

## Common Issues

- **"no elements in sequence"**: Use `take(1)` instead of `first()`
- **Multiple actions, only one works**: Use `mergeMap` instead of `switchMap` in NgRx effects
- **Tests failing**: Try deleting the `node_modules/.vite` cache directory

## Additional Resources

- Development setup: `.github/development.md`
- Angular components: `.github/instructions/angular-components.instructions.md`
- Angular services: `.github/instructions/angular-services.instructions.md`
- Angular app testing: `.github/instructions/app-testing.instructions.md`
- General testing: `.github/instructions/testing.instructions.md`
- TypeScript: `.github/instructions/typescript.instructions.md`
- NestJS API: `.github/instructions/nestjs-api.instructions.md`
- JavaScript: `.github/instructions/javascript.instructions.md`
- Documentation: `.github/instructions/documentation.instructions.md`
