---
applyTo: 'packages/altair-api/src/**/*.ts'
---

# NestJS API Development

## Module Organization

- Organize code into feature modules (e.g., auth, user, teams)
- Each module has controllers, services, and DTOs in separate files
- Use barrel exports (index.ts) for clean imports

## Controller Pattern

```typescript
@Controller('api/endpoint')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getItems(@Req() req: Request): Promise<ItemDto[]> {
    return this.exampleService.getItems(req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createItem(
    @Body() createItemDto: CreateItemDto,
    @Req() req: Request
  ): Promise<ItemDto> {
    return this.exampleService.createItem(createItemDto, req.user);
  }
}
```

## Service Pattern

Services contain business logic and data access. Return DTOs instead of raw entities.

```typescript
@Injectable()
export class ExampleService {
  constructor(
    private readonly repository: Repository<Entity>,
    private readonly logger: Logger
  ) {}

  async getItems(user: User): Promise<ItemDto[]> {
    try {
      const items = await this.repository.find({ userId: user.id });
      return items.map(item => this.toDto(item));
    } catch (error) {
      this.logger.error(`Failed to get items for user ${user.id}`, error);
      throw new InternalServerErrorException('Failed to retrieve items');
    }
  }

  private toDto(entity: Entity): ItemDto {
    return { /* ... */ };
  }
}
```

## Prisma

- Use Prisma for all database operations
- Use appropriate query options (select, include, where)
- Use transactions for complex operations

## DTOs

Use class-validator for input validation:

```typescript
export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## Authentication

- PassportJS with JWT strategy
- Use NestJS guards for route protection (`@UseGuards(AuthGuard)`)
