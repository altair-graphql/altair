---
applyTo: '**/*.{js,mjs,cjs}'
---

# JavaScript Development Instructions for Altair GraphQL Client

These instructions provide JavaScript development guidelines for build scripts, configuration files, and legacy JavaScript code in the Altair monorepo.

## Build Scripts and Configuration

### Build Scripts (bin/, scripts/)
- Use clear, self-documenting script names
- Include proper error handling and exit codes
- Provide helpful logging and progress indicators
- Use consistent command-line argument parsing

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

function main() {
  try {
    console.log('Starting build process...');
    
    // Build steps with proper error handling
    execSync('npm run lint', { stdio: 'inherit' });
    execSync('npm run test', { stdio: 'inherit' });
    execSync('npm run build:prod', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

main();
```

### Configuration Files
- Use consistent formatting and organization
- Include comments explaining complex configurations
- Validate configuration values where possible
- Use environment variables for environment-specific settings

## Node.js Scripts

### File System Operations
- Use async file operations when possible
- Handle file system errors gracefully
- Use path.join() for cross-platform compatibility
- Clean up temporary files and resources

### Process Management
- Handle process signals appropriately
- Use proper exit codes for different scenarios
- Log process lifecycle events
- Implement graceful shutdown procedures

## Module Patterns

### CommonJS Modules
- Use consistent module.exports patterns
- Group related functionality in single modules
- Provide clear module interfaces
- Handle optional dependencies gracefully

```javascript
// Good module pattern
class BuildHelper {
  constructor(options = {}) {
    this.options = { verbose: false, ...options };
  }
  
  async build() {
    if (this.options.verbose) {
      console.log('Building...');
    }
    // Implementation
  }
}

module.exports = { BuildHelper };
```

### ES Modules (where supported)
- Use import/export syntax consistently
- Prefer named exports for better IDE support
- Use dynamic imports for conditional loading

## Error Handling

### Async Operations
- Always handle promise rejections
- Use try/catch blocks appropriately
- Provide meaningful error messages
- Log errors with sufficient context

```javascript
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return processContent(content);
  } catch (error) {
    console.error(`Failed to process file ${filePath}:`, error.message);
    throw new Error(`File processing failed: ${error.message}`);
  }
}
```

## Legacy JavaScript Code

### Modernization Guidelines
- Convert to ES6+ features when possible
- Use const/let instead of var
- Implement proper error handling
- Add JSDoc comments for better documentation

### Browser Compatibility
- Use appropriate polyfills for older browsers
- Test across different browser environments
- Handle feature detection properly
- Provide graceful degradation

## Performance

### Script Performance
- Minimize file system operations
- Use streaming for large data processing
- Implement proper caching strategies
- Profile performance-critical scripts

### Memory Usage
- Clean up event listeners and timers
- Avoid memory leaks in long-running processes
- Use appropriate data structures
- Monitor memory usage in production

## Security

### Input Validation
- Validate command-line arguments
- Sanitize file paths and user inputs
- Use secure methods for file operations
- Avoid code injection vulnerabilities

### Dependency Management
- Keep dependencies up to date
- Audit dependencies for security issues
- Use lockfiles for consistent builds
- Minimize dependency surface area

## Testing

### Script Testing
- Write tests for complex build scripts
- Mock external dependencies appropriately
- Test error conditions and edge cases
- Use appropriate test frameworks (Jest, Mocha)

## Documentation

### Code Comments
- Explain complex logic and business rules
- Document function parameters and return values
- Include usage examples for utilities
- Keep comments up to date with code changes

### README Files
- Provide clear usage instructions
- Document configuration options
- Include troubleshooting guides
- Show example outputs