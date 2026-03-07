---
applyTo: '**/*.ts'
---

# TypeScript Conventions

## Imports

Group imports in order: external libraries, then internal modules, then relative imports. Prefer named exports over default exports.

```typescript
// External imports
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

// Internal imports
import { QueryState } from '../types/state.interfaces';
import { formatQuery } from '../utils/query-formatter';
```

## Type Definitions

- Prefer **interfaces** over type aliases for object shapes
- Use **union types** and **literal types** for better type safety

```typescript
interface QueryState {
  query: string;
  variables: Record<string, unknown>;
  headers: HeaderState[];
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
```

## Error Handling

Use custom error classes that extend Error:

```typescript
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## RxJS Patterns

- Use `take(1)` instead of `first()` to avoid "no elements in sequence" errors
- Use `mergeMap` instead of `switchMap` in NgRx effects when multiple actions need to complete
- Manage subscriptions properly to avoid memory leaks (unsubscribe in `ngOnDestroy`)
