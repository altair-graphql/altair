---
applyTo: '**/*.{md,mdx}'
---

# Documentation Guidelines

## Package READMEs

Every package should have a README.md covering: purpose, installation, usage, and API reference.

```markdown
# Package Name

Brief description of what this package does.

## Installation

\`\`\`bash
npm install @altairgraphql/package-name
\`\`\`

## Usage

\`\`\`typescript
import { UtilityFunction } from '@altairgraphql/package-name';

const result = UtilityFunction(input);
\`\`\`
```

## Documentation Site

The docs site uses **VitePress** and lives in `packages/altair-docs`. Organize documentation by feature and user journey.

## Changelog

Follow semantic versioning. Categorize changes: Added, Changed, Fixed, Removed. Reference related issues/PRs.

```markdown
## [2.1.0] - 2024-01-15

### Added
- New GraphQL query validation feature (#123)

### Fixed
- Fixed memory leak in subscription handling (#321)
```
