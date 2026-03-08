---
applyTo: '**'
---

# Altair GraphQL Client

Altair GraphQL Client is a feature-rich GraphQL Client IDE available on multiple platforms. This repository is a **monorepo** managed using **pnpm** and **Nx/Turbo**.

**Key Technologies:**

- **Angular** for the main web application (`packages/altair-app`)
- **NestJS** for the backend API (`packages/altair-api`)
- **Electron** for the desktop application (`packages/altair-electron`)
- **Vitest** for testing across all packages
- **VitePress** for the documentation site (`packages/altair-docs`)
- **Prisma** for database interactions (`packages/altair-db`)

**Core Package Structure (`packages/`):**

- `altair-app`: The main Angular-based frontend application.
- `altair-api`: The NestJS-based backend API.
- `altair-core`: Core logic, type definitions, and utilities shared across packages. Changes here can impact multiple parts of the application.
- `altair-crx`: The browser extension (Chrome, Firefox).
- `altair-electron`: The Electron desktop wrapper. Uses `altair-app` for the actual UI.
- `altair-db`: Database schema (Prisma) and related utilities.
- `altair-docs`: Official documentation website source.
- `altair-express-middleware`, `altair-fastify-plugin`, `altair-koa-middleware`: Middlewares for integrating Altair with Node.js backend frameworks.
- `altair-plugin`: Infrastructure for Altair's plugin system.
- `altair-static`: Static assets for the Altair client.

## Development Setup

See [.github/development.md](../development.md) for full details.

```bash
pnpm install       # Install dependencies
pnpm bootstrap     # Build local packages and link them (required before first run)
pnpm start:app     # Start web app (localhost:4200)
pnpm test          # Run tests across monorepo
```

Check individual `packages/<name>/package.json` files for package-specific scripts.

## Specialized Instructions

- **[Angular Components](./angular-components.instructions.md)** - Component patterns (OnPush, signals, custom testing framework)
- **[Angular Services](./angular-services.instructions.md)** - NgRx state management, service patterns
- **[App Testing](./app-testing.instructions.md)** - Custom `mount()` testing framework for altair-app
- **[Testing](./testing.instructions.md)** - Vitest patterns and project-specific mocking
- **[NestJS API](./nestjs-api.instructions.md)** - Backend API with Prisma
- **[TypeScript](./typescript.instructions.md)** - TypeScript conventions
- **[JavaScript](./javascript.instructions.md)** - Build scripts and configuration
- **[Documentation](./documentation.instructions.md)** - VitePress documentation site
