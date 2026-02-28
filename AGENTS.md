# AGENTS.md - Altair GraphQL Client

Guidelines for AI agents working in this repository.

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
pnpm jest --no-coverage                    # Run all Jest tests (fast, no coverage)
pnpm jest --watch                          # Watch mode
pnpm jest --clearCache                     # Clear Jest cache
pnpm jest path/to/file.spec.ts --no-coverage  # Run single test file
pnpm jest --testNamePattern="name"         # Run tests matching name
pnpm test-single-run                       # Single run with coverage
pnpm lint                                  # Run ESLint (ng lint)
pnpm build                                 # Build the app
```

> **Note:** Always run from the `packages/altair-app` directory. Use `--no-coverage` for faster runs when coverage is not needed. The test suite has 135 suites / ~1133 tests and takes ~3–4 minutes. A worker process force-exit warning and exit code 1 may appear at the end due to open handles/timers in test teardown — this is a known issue and does **not** indicate test failures. Check the summary line (`Test Suites: X passed`) to confirm actual results. There is also 1 obsolete snapshot in `account-dialog.component.spec.ts`; run `pnpm jest -u` to remove it.

## Code Style Guidelines

### TypeScript

- Use **explicit type annotations** for function parameters and return types
- Prefer **interfaces over type aliases** for object shapes
- Use **named exports** over default exports
- Leverage **generic types** for reusable components

```typescript
interface QueryState {
  query: string;
  variables: Record<string, unknown>;
  headers: HeaderState[];
}

function processQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {}
```

### Imports

Group imports in this order:
1. External libraries (rxjs, @angular/*)
2. Internal packages (@altairgraphql/*)
3. Relative imports (../, ./)

```typescript
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryState } from '@altairgraphql/core';
import { formatQuery } from '../utils/query-formatter';
```

### Angular Components

- Use **OnPush change detection** strategy
- Implement **subscription management** (unsubscribe in ngOnDestroy)
- Use **signal inputs** (`input<T>()`) and **signal outputs** (`output<T>()`)

```typescript
@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent implements OnInit, OnDestroy {
  readonly inputProperty = input<string>('');
  readonly someEvent = output<SomeType>();
  private subscription: Subscription;

  ngOnDestroy() { this.subscription?.unsubscribe(); }
}
```

### Angular Services

- Use `@Injectable({ providedIn: 'root' })` for root services
- Return **observables** from data methods
- Use **selectors** for NgRx state access
- Dispatch **actions** for state modifications

### Error Handling

- Create **custom error classes** that extend Error
- Implement proper error boundaries

```typescript
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

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
- **Tests failing**: Run `pnpm jest --clearCache`

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
