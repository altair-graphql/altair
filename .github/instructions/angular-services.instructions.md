---
applyTo: 'packages/altair-app/src/**/*.service.ts'
---

# Angular Service Development Instructions for Altair GraphQL Client

These instructions guide the development of Angular services in the Altair GraphQL Client application.

## Service Structure and Conventions

### Injectable Services
- All services should be decorated with `@Injectable({ providedIn: 'root' })` unless they need specific scope
- Follow single responsibility principle - each service should have one clear purpose
- Use dependency injection for other services and external dependencies

### State Management Services
- Services that interact with the NgRx store should inject `Store<RootState>`
- Use selectors for accessing state data
- Dispatch actions for state modifications
- Return observables from methods that provide data

### Example Service Pattern:
```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  constructor(
    private store: Store<RootState>,
    private http: HttpClient
  ) {}

  getData$(): Observable<DataType> {
    return this.store.select(selectData);
  }

  performAction(payload: PayloadType): void {
    this.store.dispatch(someAction({ payload }));
  }

  private handleError(error: any): Observable<never> {
    console.error('Service error:', error);
    return EMPTY;
  }
}
```

## HTTP Services
- Use Angular's HttpClient for API calls
- Implement proper error handling and retry logic
- Use RxJS operators for data transformation
- Return typed observables with proper interfaces

## Storage Services
- Follow existing patterns for localStorage and sessionStorage
- Handle storage quota and errors gracefully
- Use async operations for IndexedDB interactions

## Utility Services
- Keep utility functions pure and testable
- Avoid side effects in utility methods
- Export utility functions for reuse across components

## Testing Services
- Mock external dependencies using Jest mocks
- Test public methods and observable streams
- Verify store interactions (selectors and actions)
- Test error handling scenarios

## Error Handling
- Use consistent error handling patterns
- Log errors appropriately for debugging
- Provide user-friendly error messages
- Handle network failures gracefully

## Performance Considerations
- Use shareReplay() for expensive operations
- Implement proper caching strategies
- Avoid memory leaks with proper subscription management
- Use lazy loading for heavy services