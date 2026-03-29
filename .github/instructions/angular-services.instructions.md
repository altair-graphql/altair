---
applyTo: 'packages/altair-app/src/**/*.service.ts'
---

# Angular Service Development

## State Management Services

- Services that interact with NgRx should inject `Store<RootState>`
- Use **selectors** for accessing state data
- **Dispatch actions** for state modifications
- Return **observables** from data methods

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

## Testing Services

- Mock external dependencies using Vitest mocks (`vi.mock`, `vi.fn`)
- Verify store interactions (selectors and actions)
- Test observable streams and error handling scenarios

## Performance

- Use `shareReplay()` for expensive operations
- Avoid memory leaks with proper subscription management
- Use lazy loading for heavy services
