---
applyTo: '**/*.{json,yml,yaml}'
---

# Configuration File Instructions for Altair GraphQL Client

These instructions provide guidelines for maintaining configuration files, package.json files, and other structured data files in the Altair monorepo.

## Package.json Files

### Monorepo Package Management
- Use consistent versioning across related packages
- Maintain proper dependency relationships between local packages
- Keep dev dependencies in the root package.json when possible
- Use pnpm workspace features for dependency management

```json
{
  "name": "@altairgraphql/package-name",
  "version": "1.0.0",
  "description": "Clear description of package purpose",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@altairgraphql/core": "workspace:*"
  },
  "peerDependencies": {
    "rxjs": "^7.0.0"
  }
}
```

### Script Organization
- Group related scripts logically (build, test, lint, deploy)
- Use consistent naming conventions across packages
- Provide clear script descriptions
- Use npm/pnpm script composition for complex workflows

### Dependency Management
- Use exact versions for critical dependencies
- Use workspace protocol for local package dependencies
- Keep peer dependencies minimal and well-documented
- Regularly audit and update dependencies

## TypeScript Configuration (tsconfig.json)

### Base Configuration
- Extend from base configurations when possible
- Use strict TypeScript settings for better type safety
- Configure path mapping for clean imports
- Set appropriate target and module settings

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Build Configuration

### Jest Configuration
- Use consistent test patterns across packages
- Configure appropriate test environments
- Set up proper module resolution
- Include coverage reporting

```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/src"],
  "testMatch": ["**/__tests__/**/*.test.ts"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"]
}
```

### ESLint Configuration
- Extend from shared configurations
- Use TypeScript-aware rules
- Configure import sorting and organization
- Set up consistent formatting rules

### Vite/Webpack Configuration
- Use environment-specific configurations
- Implement proper code splitting
- Configure asset optimization
- Set up development server properly

## CI/CD Configuration (GitHub Actions)

### Workflow Files (.github/workflows/)
- Use consistent workflow naming
- Implement proper error handling
- Cache dependencies appropriately
- Use matrix builds for multi-environment testing

```yaml
name: CI
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

## Docker Configuration

### Dockerfiles
- Use multi-stage builds for optimization
- Pin base image versions for consistency
- Minimize image layers and size
- Include proper health checks

### Docker Compose
- Use environment-specific compose files
- Configure proper service dependencies
- Set up development and production variants
- Include proper volume and network configuration

## Environment Configuration

### Environment Variables
- Use .env.example to document required variables
- Group related environment variables
- Validate environment configuration on startup
- Use different configurations for different environments

```yaml
# .env.example
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/altair

# API Configuration  
API_PORT=3000
API_HOST=localhost

# External Services
OPENAI_API_KEY=your_openai_api_key_here
```

## Validation and Documentation

### JSON Schema
- Use JSON Schema for configuration validation where appropriate
- Provide clear error messages for invalid configurations
- Document configuration options thoroughly
- Include examples for complex configurations

### Comments in JSON
- Use package.json comments field for documentation
- Explain complex configuration decisions
- Reference related documentation
- Include migration guides for configuration changes

## Security Considerations

### Sensitive Data
- Never commit secrets or API keys to configuration files
- Use environment variables for sensitive configuration
- Implement proper secret rotation strategies
- Audit configuration files for exposed credentials

### Access Control
- Implement proper file permissions for configuration files
- Use secure defaults for all configuration options
- Validate all configuration inputs
- Log configuration changes for audit trails