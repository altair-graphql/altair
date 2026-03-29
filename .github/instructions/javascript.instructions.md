---
applyTo: '**/*.{js,mjs,cjs}'
---

# JavaScript / Build Script Conventions

## CommonJS Modules

Build scripts and configuration files use CommonJS. Use consistent `module.exports` patterns:

```javascript
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

## Testing

Use Vitest for testing build scripts. Mock external dependencies appropriately.
