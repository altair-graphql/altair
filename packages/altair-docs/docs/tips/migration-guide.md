---
parent: Tips
---

# Migration and Upgrade Guide

This guide helps you migrate between different versions of Altair and handle breaking changes in your GraphQL workflows.

## Altair Version Migrations

### Major Version Upgrades

**Pre-Upgrade Checklist**:
- [ ] Export all collections and queries
- [ ] Document current environment variables
- [ ] Note any custom plugins in use
- [ ] Backup application settings
- [ ] Take screenshots of important configurations

### Backing Up Your Data

**1. Export Collections**

Before any major upgrade:

1. Open each collection
2. Click "Export Collection" 
3. Save to a safe location
4. Alternatively, export all application data:
   - Settings → Import/Export → Export Application Data

**2. Environment Variables Backup**

```json
// Save this to a file: altair-environments-backup.json
{
  "environments": {
    "local": {
      "API_URL": "http://localhost:4000/graphql",
      "AUTH_TOKEN": "your_token_here"
    },
    "production": {
      "API_URL": "https://api.example.com/graphql",
      "AUTH_TOKEN": "{{PROD_TOKEN}}"
    }
  },
  "backup_date": "2024-01-15",
  "altair_version": "5.2.1"
}
```

**3. Plugin Configuration Backup**

Document your plugins:

```json
{
  "plugins": [
    "altair-graphql-plugin-graphql-explorer",
    "altair-graphql-plugin-birdseye@1.0.0",
    "url:altair-graphql-plugin-custom@1.0.0::[url]->[http://localhost:8080]"
  ],
  "backup_date": "2024-01-15"
}
```

### Post-Upgrade Verification

**1. Verify Core Functionality**
- [ ] Can connect to GraphQL endpoints
- [ ] Schema loading works correctly
- [ ] Query execution functions properly
- [ ] Collections are accessible
- [ ] Authentication still works

**2. Check Environment Variables**
- [ ] All environments imported correctly
- [ ] Variable interpolation works
- [ ] No missing or corrupted values

**3. Verify Plugin Compatibility**
- [ ] All plugins load successfully
- [ ] Plugin functionality works as expected
- [ ] Update incompatible plugins

## GraphQL Schema Migrations

### Handling Breaking Schema Changes

**1. Identifying Breaking Changes**

Use Altair to detect schema changes:

```graphql
# Query to understand schema structure
query SchemaIntrospection {
  __schema {
    types {
      name
      kind
      fields {
        name
        type {
          name
          kind
        }
        isDeprecated
        deprecationReason
      }
    }
  }
}
```

**2. Common Breaking Changes and Solutions**

**Field Removal**:
```graphql
# Before (working query)
query GetUser {
  user(id: "123") {
    id
    name
    oldField  # This field was removed
  }
}

# After (updated query)
query GetUser {
  user(id: "123") {
    id
    name
    newField  # Use replacement field
  }
}
```

**Type Changes**:
```graphql
# Before: String field
query GetUser {
  user(id: "123") {
    id
    status  # Was String, now enum
  }
}

# After: Enum field
query GetUser {
  user(id: "123") {
    id
    status  # Now returns UserStatus enum
  }
}
```

**Argument Changes**:
```graphql
# Before: Single argument
query GetUsers {
  users(limit: 10) {
    id
    name
  }
}

# After: New argument structure
query GetUsers {
  users(pagination: { limit: 10, offset: 0 }) {
    id
    name
  }
}
```

### Schema Migration Workflow

**1. Gradual Migration Process**

Create migration queries step by step:

```graphql
# Step 1: Test new schema availability
query TestNewSchema {
  __type(name: "NewUserType") {
    name
    fields {
      name
      type {
        name
      }
    }
  }
}

# Step 2: Create hybrid query (if possible)
query HybridQuery {
  # Old way (might be deprecated)
  userOld: user(id: "123") {
    id
    name
  }
  
  # New way
  userNew: userV2(id: "123") {
    id
    name
    additionalField
  }
}

# Step 3: Fully migrated query
query MigratedQuery {
  user(id: "123") {
    id
    name
    additionalField
  }
}
```

**2. Testing Migration Impact**

Create test collection for migration validation:

```graphql
# Collection: Schema Migration Tests

# Test 1: Basic connectivity
query ConnectivityTest {
  __schema {
    queryType {
      name
    }
  }
}

# Test 2: Core entity queries
query CoreEntityTest {
  users(first: 1) {
    id
    name
  }
  posts(first: 1) {
    id
    title
  }
}

# Test 3: Authentication still works
query AuthTest {
  me {
    id
    name
  }
}

# Test 4: Critical business queries
query CriticalBusinessTest {
  # Add your most important queries here
  dashboard {
    totalUsers
    totalPosts
    systemStatus
  }
}
```

## API Version Migrations

### Versioned GraphQL APIs

**1. Multi-Version Testing Setup**

Environment configuration for testing multiple API versions:

```json
{
  "api_v1": {
    "API_URL": "https://api.example.com/graphql/v1",
    "AUTH_TOKEN": "{{AUTH_TOKEN}}",
    "API_VERSION": "1.0"
  },
  "api_v2": {
    "API_URL": "https://api.example.com/graphql/v2",
    "AUTH_TOKEN": "{{AUTH_TOKEN}}",
    "API_VERSION": "2.0"
  },
  "api_v2_beta": {
    "API_URL": "https://api.example.com/graphql/v2-beta",
    "AUTH_TOKEN": "{{AUTH_TOKEN}}",
    "API_VERSION": "2.0-beta"
  }
}
```

**2. Version Comparison Queries**

Create queries to compare API versions:

```graphql
# V1 API Query
query GetUserV1 {
  user(id: "123") {
    id
    name
    email
    created_at
  }
}

# V2 API Query
query GetUserV2 {
  user(id: "123") {
    id
    name
    email
    createdAt  # Note: camelCase in v2
    profile {  # New nested structure in v2
      bio
      avatar
    }
  }
}
```

### Gradual API Migration

**1. Parallel Testing Strategy**

Test both versions manually:

1. **Set up two separate environments** in Altair:
   - V1_API: pointing to `https://api.example.com/graphql/v1`
   - V2_API: pointing to `https://api.example.com/graphql/v2`

2. **Run the same queries** against both versions

3. **Compare responses** to identify differences

4. **Document breaking changes** you discover

5. **Create migration checklist** based on differences found

This manual testing approach helps identify:
- Schema differences
- Response format changes
- Deprecated fields
- New required fields
- Performance differences
function convertV1QueryToV2(query) {
  // Simple conversion logic - adapt for your API
  return query
    .replace(/created_at/g, 'createdAt')
    .replace(/updated_at/g, 'updatedAt');
}

// Run the test
testBothVersions();
```

## Platform Migrations

### Moving Between Altair Platforms

**1. Web App to Desktop App**

Benefits of migration:
- Better performance
- No CORS limitations
- Full feature set
- Better file upload support

Migration steps:
1. Export all data from web app
2. Install desktop app
3. Import data to desktop app
4. Verify all functionality

**2. Browser Extension to Desktop App**

Migration considerations:
- Extension has storage limitations
- Desktop app offers better performance
- Some features only available in desktop

**3. Cross-Platform Data Sync**

Use Altair Cloud for seamless sync:
1. Create Altair Cloud account
2. Export data from old platform
3. Import to new platform
4. Enable cloud sync for future consistency

### Operating System Migrations

**Moving Between OS Platforms**:

**Data Location by OS**:
- **Windows**: `%APPDATA%\Altair GraphQL Client`
- **macOS**: `~/Library/Application Support/Altair GraphQL Client`
- **Linux**: `~/.config/Altair GraphQL Client`

**Migration Process**:
1. Export application data on old OS
2. Install Altair on new OS
3. Import application data
4. Verify settings and collections

## Troubleshooting Migration Issues

### Common Migration Problems

**1. Data Import Failures**

```javascript
// Validation script for imported data
const validateImportedData = (data) => {
  const issues = [];
  
  // Check collections
  if (!data.collections || !Array.isArray(data.collections)) {
    issues.push('Collections data missing or invalid');
  }
  
  // Check environments
  if (!data.environments) {
    issues.push('Environment variables missing');
  }
  
  // Check queries
  data.collections?.forEach((collection, index) => {
    if (!collection.queries || !Array.isArray(collection.queries)) {
      issues.push(`Collection ${index} has invalid queries`);
    }
  });
  
  return issues;
};

// Example usage
const importedData = JSON.parse(/* your imported data */);
const issues = validateImportedData(importedData);

if (issues.length > 0) {
  console.error('Import validation issues:', issues);
} else {
  console.log('Import data validation passed');
}
```

**2. Environment Variable Issues**

```javascript
// Script to fix common environment variable problems
const fixEnvironmentVariables = (environments) => {
  const fixed = {};
  
  Object.keys(environments).forEach(envName => {
    const env = environments[envName];
    fixed[envName] = {};
    
    Object.keys(env).forEach(key => {
      let value = env[key];
      
      // Fix common issues
      if (typeof value !== 'string') {
        value = String(value);
      }
      
      // Remove extra quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Validate URLs
      if (key.includes('URL') && !value.match(/^https?:\/\//)) {
        console.warn(`Potentially invalid URL in ${envName}.${key}: ${value}`);
      }
      
      fixed[envName][key] = value;
    });
  });
  
  return fixed;
};
```

### Recovery Procedures

**1. Partial Data Recovery**

If migration partially fails:

```javascript
// Manual data reconstruction script
const reconstructData = (partialData) => {
  const template = {
    version: 1,
    collections: [],
    environments: {},
    settings: {},
    headers: {}
  };
  
  // Merge available data
  if (partialData.collections) {
    template.collections = partialData.collections;
  }
  
  if (partialData.environments) {
    template.environments = partialData.environments;
  }
  
  // Add default environments if missing
  if (Object.keys(template.environments).length === 0) {
    template.environments.local = {
      API_URL: "http://localhost:4000/graphql",
      AUTH_TOKEN: "your_token_here"
    };
  }
  
  return template;
};
```

**2. Emergency Rollback**

If migration causes issues:

1. **Immediate Steps**:
   - Don't panic - data is usually recoverable
   - Check if backup files exist
   - Try importing previous export

2. **Recovery Options**:
   - Reinstall previous Altair version
   - Import from backup files
   - Recreate critical queries manually
   - Contact support with error details

## Migration Best Practices

### Before Migration
- [ ] Always create complete backups
- [ ] Test migration in non-production environment first
- [ ] Document current configuration
- [ ] Plan rollback strategy
- [ ] Schedule migration during low-usage periods

### During Migration
- [ ] Follow migration steps carefully
- [ ] Verify each step before proceeding
- [ ] Keep detailed logs of any issues
- [ ] Don't skip validation steps
- [ ] Test critical functionality immediately

### After Migration
- [ ] Verify all data imported correctly
- [ ] Test all major workflows
- [ ] Update team documentation
- [ ] Communicate changes to team members
- [ ] Monitor for any issues over first few days

### Long-term Maintenance
- [ ] Set up regular backup schedules
- [ ] Keep migration documentation updated
- [ ] Train team members on migration procedures
- [ ] Review and update migration strategies periodically

By following this migration guide, you can confidently upgrade Altair versions, migrate between platforms, and handle GraphQL schema changes without losing valuable work or disrupting your development workflow.