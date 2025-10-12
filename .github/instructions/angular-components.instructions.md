---
applyTo: 'packages/altair-app/src/**/*.component.ts'
---

# Angular Component Development Instructions for Altair GraphQL Client

These instructions guide the development of Angular components in the Altair GraphQL Client application.

## Component Structure and Conventions

### File Naming and Organization

- Components are located in `packages/altair-app/src/app/modules/altair/components/`
- Follow kebab-case naming convention for component files (e.g., `query-editor.component.ts`)
- Each component should have its own directory with related files (.ts, .html, .scss, .spec.ts)

### Component Class Structure

- Use OnPush change detection strategy for better performance when possible
- Implement lifecycle hooks appropriately (OnInit, OnDestroy, etc.)
- Follow the single responsibility principle - each component should have one clear purpose
- Use dependency injection for services and dependencies

### State Management

- Use reactive programming patterns with RxJS observables
- Properly manage subscriptions and clean them up in ngOnDestroy
- Emit events using Angular's EventEmitter for parent-child communication
- Use input and output for component API

### Example Component Pattern:

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent implements OnInit, OnDestroy {
  readonly inputProperty = input<string>('');
  readonly someEvent = output<SomeType>();

  private subscription: Subscription;

  constructor(
    private store: Store<RootState>,
    private someService: SomeService
  ) {}

  ngOnInit() {
    this.subscription = this.store.select(selectSomeState).subscribe((state) => {
      // Handle state changes
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onSomeAction() {
    this.someEvent.emit(someData);
  }
}
```

## UI Library Integration

### ng-zorro Components

- Use ng-zorro ant design components for consistent UI
- Follow existing patterns for modal dialogs, forms, and navigation
- Don't test ng-zorro component properties in unit tests - focus on business logic

### Form Handling

- Use Angular reactive forms for complex forms
- Implement proper validation and error handling
- Follow accessibility guidelines

## Testing Guidelines

- Write unit tests focusing on component business logic only
- Use the custom testing framework in `packages/altair-app/src/testing`
- Test event emissions, state changes, and method behavior
- Mock external dependencies and services
- Don't test UI library components or template rendering details

## Performance Considerations

- Use OnPush change detection where appropriate
- Implement trackBy functions for ngFor loops
- Lazy load components when possible
- Avoid memory leaks by properly unsubscribing from observables

## Accessibility

- Include proper ARIA attributes for screen readers
- Ensure keyboard navigation works correctly
- Use semantic HTML elements
- Test with accessibility tools
