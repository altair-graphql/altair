---
applyTo: 'packages/altair-api/src/**/*.ts'
---

# NestJS API Development Instructions for Altair GraphQL Client

These instructions guide the development of the NestJS backend API for Altair GraphQL Client.

## API Structure and Conventions

### Module Organization
- Organize code into feature modules (e.g., auth, user, teams, etc.)
- Each module should have controllers, services, and DTOs in separate files
- Use barrel exports (index.ts) for clean imports

### Controller Patterns
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

### Service Implementation
- Services contain business logic and data access
- Use dependency injection for repositories and other services
- Implement proper error handling with custom exceptions
- Return DTOs instead of raw entities

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
    // Transform entity to DTO
    return { /* ... */ };
  }
}
```

## Database and Prisma

### Prisma Integration
- Use Prisma for database operations and schema management
- Define models in the prisma schema file
- Use Prisma Client for type-safe database queries
- Handle database migrations properly

### Query Optimization
- Use appropriate Prisma query options (select, include, where)
- Implement pagination for large datasets
- Use transactions for complex operations
- Monitor query performance

## Authentication and Authorization

### JWT Authentication
- Use PassportJS with JWT strategy
- Implement proper token validation and refresh
- Handle authentication errors gracefully

### Guards and Decorators
- Use NestJS guards for route protection
- Implement role-based access control
- Create custom decorators for common patterns

## Data Transfer Objects (DTOs)

### DTO Classes
- Use class-validator for input validation
- Implement class-transformer for serialization
- Create separate DTOs for create, update, and response operations

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

## Error Handling
- Use NestJS built-in exception filters
- Create custom exceptions for domain-specific errors
- Log errors appropriately with context
- Return consistent error responses

## Testing
- Write unit tests for services and controllers
- Use NestJS testing utilities
- Mock dependencies properly
- Test authentication and authorization scenarios

## Configuration
- Use NestJS ConfigModule for environment variables
- Validate configuration on startup
- Use type-safe configuration classes

## Logging
- Use structured logging with proper levels
- Include request context in logs
- Log performance metrics for monitoring

## API Documentation
- Use Swagger/OpenAPI decorators for documentation
- Keep API documentation up to date
- Provide example requests and responses

## Performance and Security
- Implement rate limiting for API endpoints
- Use CORS appropriately
- Validate all input data
- Implement proper SQL injection protection
- Use HTTPS in production
- Monitor API performance and errors