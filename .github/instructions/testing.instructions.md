---
applyTo: '**/*.{test,spec}.{ts,js}'
---

# Testing Instructions for Altair GraphQL Client

> For Angular app-specific testing, see [app-testing.instructions.md](./app-testing.instructions.md) which covers the custom `mount()` framework in `packages/altair-app/src/testing`.

## Mocking with Vitest

Use `vi.mock`, `vi.fn`, and `vi.spyOn` for mocking:

```typescript
vi.mock('../services/api.service');

describe('UserController', () => {
  let controller: UserController;
  let mockApiService: MockInstance & ApiService;

  beforeEach(() => {
    mockApiService = {
      getUser: vi.fn(),
      updateUser: vi.fn(),
    } as unknown as MockInstance & ApiService;

    controller = new UserController(mockApiService);
  });

  it('should call ApiService.getUser with correct parameters', async () => {
    const userId = '123';
    vi.mocked(mockApiService.getUser).mockResolvedValue({ id: userId, name: 'John' });

    await controller.getUser(userId);

    expect(mockApiService.getUser).toHaveBeenCalledWith(userId);
  });
});
```

## Angular Component Testing

Use the custom testing framework in `packages/altair-app/src/testing`:

```typescript
import { mount } from '../testing';
import { ExampleComponent } from './example.component';

describe('ExampleComponent', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(ExampleComponent, {
      props: { initialValue: 'test' },
      providers: [
        { provide: SomeService, useValue: mockSomeService }
      ]
    });
  });

  it('should emit event when button is clicked', () => {
    wrapper.componentInstance.onButtonClick();
    expect(wrapper.emitted().buttonClicked).toBeTruthy();
    expect(wrapper.emitted().buttonClicked[0]).toEqual(['test-data']);
  });
});
```

**Do not test** UI library component properties (ng-zorro, Angular Material), template rendering, or CSS styling.

## NestJS Controller Testing

```typescript
describe('UsersController', () => {
  let controller: UsersController;
  let service: { findAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useFactory: () => ({
            findAll: vi.fn(),
            create: vi.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });
});
```

## Browser Extension Testing

Mock Chrome APIs for extension tests:

```typescript
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
  },
};

global.chrome = mockChrome;
```

## Test Data Factories

Create reusable factories for test data:

```typescript
const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});
```
