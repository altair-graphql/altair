---
applyTo: '**/*.{md,mdx}'
---

# Documentation Instructions for Altair GraphQL Client

These instructions provide guidelines for creating and maintaining documentation in the Altair GraphQL Client repository.

## Documentation Structure

### README Files
- Every package should have a clear README.md file
- Include purpose, installation, usage, and API documentation
- Provide working code examples
- Keep documentation up to date with code changes

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

## API Reference

### Functions

#### UtilityFunction(input: InputType): OutputType

Description of what the function does.

**Parameters:**
- \`input\` (InputType): Description of the input parameter

**Returns:** OutputType - Description of the return value
```

### Project Documentation
- Use the docs package (VitePress) for comprehensive documentation
- Organize documentation by feature and user journey
- Include getting started guides and tutorials
- Provide troubleshooting and FAQ sections

## Writing Guidelines

### Clarity and Consistency
- Use clear, concise language
- Follow consistent terminology throughout documentation
- Write for your target audience (developers, end users)
- Use active voice and present tense

### Code Examples
- Provide complete, working code examples
- Test all code examples to ensure they work
- Use realistic, relevant examples
- Include both basic and advanced usage patterns

```typescript
// ✅ Good: Complete, working example
import { QueryEditor } from '@altairgraphql/app';

const editor = new QueryEditor({
  query: 'query { user { id name } }',
  variables: { id: '123' }
});

editor.format(); // Returns formatted query
```

### Structure and Organization
- Use clear headings and subheadings
- Organize content logically from basic to advanced
- Use bullet points and numbered lists for clarity
- Include table of contents for long documents

## API Documentation

### Function Documentation
- Document all public functions and classes
- Include parameter types and descriptions
- Describe return values and possible exceptions
- Provide usage examples for complex APIs

### Interface Documentation
- Document all public interfaces and types
- Explain the purpose and usage context
- Include example implementations
- Note any constraints or requirements

## User Guides

### Feature Documentation
- Explain features from the user's perspective
- Include step-by-step instructions with screenshots
- Cover common use cases and workflows
- Provide troubleshooting tips

### Migration Guides
- Create migration guides for breaking changes
- Provide before/after code examples
- Explain the reasoning behind changes
- Include automated migration tools when possible

## Contributing Documentation

### Development Setup
- Document the development environment setup process
- Include all prerequisites and dependencies
- Provide troubleshooting for common setup issues
- Keep setup instructions up to date

### Coding Guidelines
- Document coding standards and conventions
- Explain architecture decisions and patterns
- Include examples of good and bad practices
- Reference automated tools (linters, formatters)

## Release Documentation

### Changelog
- Follow semantic versioning principles
- Categorize changes (Added, Changed, Fixed, Removed)
- Include migration notes for breaking changes
- Reference related issues and pull requests

```markdown
## [2.1.0] - 2024-01-15

### Added
- New GraphQL query validation feature (#123)
- Support for custom headers in subscriptions (#456)

### Changed
- Improved performance of large query formatting (#789)

### Fixed
- Fixed memory leak in subscription handling (#321)

### Removed
- Deprecated legacy authentication methods (#654)
```

### Release Notes
- Highlight major features and improvements
- Include upgrade instructions
- Mention any breaking changes
- Provide links to detailed documentation

## Documentation Maintenance

### Regular Updates
- Review documentation with each release
- Update examples to match current API
- Remove outdated information
- Fix broken links and references

### Community Contributions
- Welcome documentation contributions from the community
- Provide templates for different types of documentation
- Review documentation changes thoroughly
- Maintain consistent style and quality

## Accessibility

### Inclusive Language
- Use inclusive and accessible language
- Avoid technical jargon when possible
- Define technical terms clearly
- Consider non-native English speakers

### Visual Accessibility
- Use proper heading hierarchy
- Include alt text for images and screenshots
- Ensure sufficient color contrast
- Test with screen readers when possible

## Tools and Automation

### Documentation Generation
- Use automated tools for API documentation when possible
- Keep generated documentation in sync with code
- Review generated content for quality and completeness
- Supplement generated docs with handwritten guides

### Link Checking
- Regularly check for broken internal and external links
- Use automated tools to identify broken links
- Update or remove outdated references
- Maintain a consistent link structure