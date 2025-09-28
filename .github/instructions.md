---
applyTo: '**'
---

# GitHub Copilot Instructions for Altair GraphQL Client

This file provides a comprehensive overview of coding standards, conventions, and best practices for the Altair GraphQL Client monorepo. These instructions help ensure consistent code quality and maintainability across all packages.

## Repository Overview

Altair GraphQL Client is a feature-rich GraphQL Client IDE built as a monorepo with multiple packages covering:

- **Frontend (Angular)**: `packages/altair-app` - Main web application
- **Backend (NestJS)**: `packages/altair-api` - API server with authentication and data persistence  
- **Core Logic**: `packages/altair-core` - Shared utilities, types, and business logic
- **Desktop**: `packages/altair-electron` - Electron wrapper for desktop app
- **Browser Extensions**: `packages/altair-crx` - Chrome/Firefox extensions
- **Documentation**: `packages/altair-docs` - VitePress-based documentation site
- **Middleware**: Various framework integrations (Express, Fastify, Koa)

## Key Technologies

- **TypeScript** - Primary development language across all packages
- **Angular** - Frontend framework with NgRx for state management
- **NestJS** - Backend framework with Prisma for database operations
- **Electron** - Desktop application framework
- **Jest** - Testing framework for unit and integration tests
- **pnpm** - Package manager with workspace support
- **Vite/Webpack** - Build tools and bundlers

## Development Workflow

### Getting Started
1. Install dependencies: `pnpm install`
2. Bootstrap packages: `pnpm bootstrap`
3. Start development server: `pnpm start:app`
4. Run tests: `pnpm test`

### Code Quality Standards
- Use TypeScript strict mode for type safety
- Follow consistent naming conventions (camelCase for variables, PascalCase for classes)
- Implement proper error handling and logging
- Write comprehensive tests focusing on business logic
- Use ESLint and Prettier for code formatting
- Follow single responsibility principle

### Testing Strategy
- Unit tests for individual components and services
- Integration tests for API endpoints and data flows
- Component tests focusing on business logic, not UI libraries
- Mock external dependencies appropriately
- Maintain high test coverage (>80% target)

## Package-Specific Guidelines

### Angular Components (`packages/altair-app/src/**/*.component.ts`)
- Use OnPush change detection for performance
- Implement proper lifecycle management with OnInit/OnDestroy
- Use SubscriptionHandler pattern for observable cleanup
- Follow reactive programming patterns with RxJS
- Test business logic, not UI library behavior

### Angular Services (`packages/altair-app/src/**/*.service.ts`)
- Use singleton services with `providedIn: 'root'`
- Interact with NgRx store using selectors and actions
- Return observables for async operations
- Implement proper error handling and logging

### NestJS API (`packages/altair-api/src/**/*.ts`)
- Organize code into feature modules
- Use DTOs for request/response validation
- Implement JWT authentication with guards
- Use Prisma for type-safe database operations
- Follow REST/GraphQL API best practices

### Core Logic (`packages/altair-core/src/**/*.ts`)
- Write pure functions without side effects
- Use generics for reusable components
- Implement proper TypeScript interfaces
- Ensure browser and Node.js compatibility

## File Type Conventions

### TypeScript Files
- Use explicit type annotations for public APIs
- Prefer interfaces over type aliases for objects
- Implement proper error handling with custom error classes
- Use consistent import/export patterns

### Configuration Files
- Maintain consistent formatting and organization
- Use environment variables for environment-specific settings
- Include validation for configuration values
- Document complex configurations with comments

### Test Files
- Follow AAA pattern (Arrange-Act-Assert)
- Use descriptive test names explaining expected behavior
- Mock dependencies to isolate units under test
- Test both success and error scenarios

### Documentation Files
- Provide clear installation and usage instructions
- Include working code examples
- Maintain up-to-date API documentation
- Write for the target audience (developers vs end-users)

## Security and Performance

### Security Practices
- Validate all user inputs
- Never commit secrets to version control
- Implement proper authentication and authorization
- Use HTTPS in production environments
- Audit dependencies regularly

### Performance Optimization
- Use lazy loading for heavy components
- Implement proper caching strategies
- Monitor bundle sizes and memory usage
- Use OnPush change detection in Angular
- Optimize database queries with proper indexing

## Architecture Patterns

### State Management
- Use NgRx for Angular application state
- Follow Redux patterns with actions, reducers, and selectors
- Implement proper side effect handling with NgRx Effects
- Use reactive patterns with RxJS observables

### Error Handling
- Create custom error classes extending Error
- Implement global error handlers
- Log errors with sufficient context
- Provide user-friendly error messages

### Code Organization
- Group related functionality in modules
- Use barrel exports for clean imports
- Follow consistent file and directory naming
- Separate concerns appropriately

## Contribution Guidelines

### Code Review Standards
- Review code for functionality, performance, and security
- Ensure tests cover new functionality
- Verify documentation is updated
- Check for breaking changes and migration paths

### Documentation Requirements
- Update README files for package changes
- Include code examples in documentation
- Maintain API documentation with code changes
- Write migration guides for breaking changes

## Tools and Automation

### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Jest for testing
- TypeScript compiler for type checking
- pnpm for package management

### CI/CD Pipeline
- Automated testing on pull requests
- Code quality checks and security scans
- Automated deployments for releases
- Performance monitoring and error tracking

This repository follows established patterns and conventions to maintain code quality and developer experience. When making changes, follow existing patterns and update documentation accordingly.