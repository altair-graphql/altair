---
applyTo: 'packages/altair-app/src/**/*.component.ts'
---

# Angular Component Development

## File Organization

- Components are in `packages/altair-app/src/app/modules/altair/components/`
- Kebab-case naming: `query-editor.component.ts`
- Each component has its own directory with `.ts`, `.html`, `.scss`, `.spec.ts`

## Component Pattern

- Use **OnPush** change detection
- Use **signal inputs** (`input<T>()`) and **signal outputs** (`output<T>()`)
- Clean up subscriptions in `ngOnDestroy`

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

## ng-zorro Integration

- Use ng-zorro ant design components for consistent UI
- Follow existing patterns for modal dialogs, forms, and navigation
- Don't test ng-zorro component properties in unit tests - focus on business logic

## Testing

- Use the custom testing framework in `packages/altair-app/src/testing`
- Test event emissions, state changes, and method behavior
- Mock external dependencies and services
- Don't test UI library components or template rendering details
