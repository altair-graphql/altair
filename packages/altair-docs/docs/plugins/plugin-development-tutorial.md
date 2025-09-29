---
parent: Plugins
---

# Plugin Development Tutorial

Learn how to create custom plugins for Altair GraphQL Client with this comprehensive step-by-step tutorial.

## Getting Started

### Prerequisites

Before you start developing plugins:

- **Node.js**: Version 14 or higher
- **npm or yarn**: Package manager
- **TypeScript knowledge**: Recommended for better development experience
- **Altair installed**: Desktop app or browser extension for testing

### Plugin Architecture Overview

Altair plugins are JavaScript modules that extend Altair's functionality:

- **Manifest-based**: Plugins define capabilities in a manifest
- **Event-driven**: Respond to Altair events and user actions
- **Sandboxed**: Run in a secure context with limited API access
- **Shareable**: Can be published to npm for easy distribution

## Creating Your First Plugin

### 1. Project Setup

Create a new plugin project:

```bash
mkdir altair-graphql-plugin-my-first-plugin
cd altair-graphql-plugin-my-first-plugin
npm init -y
```

Install the plugin SDK:

```bash
npm install altair-graphql-plugin-sdk --save
npm install @types/node typescript --save-dev
```

### 2. Plugin Structure

Create the basic plugin structure:

```
altair-graphql-plugin-my-first-plugin/
├── src/
│   ├── index.ts          # Main plugin entry point
│   ├── manifest.json     # Plugin configuration
│   └── styles.css        # Optional styles
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### 3. Plugin Manifest

Create `src/manifest.json`:

```json
{
  "manifest_version": 2,
  "name": "My First Plugin",
  "version": "1.0.0",
  "description": "A simple example plugin for Altair GraphQL Client",
  "author": "Your Name <your.email@example.com>",
  "display_name": "My First Plugin",
  "plugin_class": "MyFirstPlugin",
  "capabilities": [
    "query:modify",
    "response:transform",
    "ui:panel"
  ],
  "sidebar": {
    "title": "My Plugin",
    "icon": "🚀"
  }
}
```

### 4. Plugin Implementation

Create `src/index.ts`:

```typescript
import { 
  AltairPlugin, 
  PluginContext, 
  PluginEvent,
  PluginManifest 
} from 'altair-graphql-plugin-sdk';

export class MyFirstPlugin extends AltairPlugin {
  private context: PluginContext;
  
  constructor(ctx: PluginContext, manifest: PluginManifest) {
    super(ctx, manifest);
    this.context = ctx;
  }

  /**
   * Called when the plugin is initialized
   */
  async initialize(): Promise<void> {
    console.log('My First Plugin initialized!');
    
    // Add plugin panel to sidebar
    this.context.app.addSidebar({
      title: 'My Plugin',
      icon: '🚀',
      content: this.createPluginPanel()
    });

    // Listen for query events
    this.context.events.on('query.send-request', this.onQuerySend.bind(this));
    this.context.events.on('query.response', this.onQueryResponse.bind(this));
  }

  /**
   * Create the plugin's UI panel
   */
  private createPluginPanel(): string {
    return `
      <div class="plugin-panel">
        <h3>My First Plugin</h3>
        <p>Welcome to your first Altair plugin!</p>
        <button id="hello-button" class="btn btn-primary">
          Say Hello
        </button>
        <div id="plugin-output"></div>
      </div>
    `;
  }

  /**
   * Called when a query is about to be sent
   */
  private async onQuerySend(event: PluginEvent): Promise<void> {
    console.log('Query being sent:', event.data.query);
    
    // Add a custom header to the request
    await this.context.request.setHeader('X-Plugin-Version', '1.0.0');
    
    // Modify the query (example: add a comment)
    const modifiedQuery = `# Modified by My First Plugin\n${event.data.query}`;
    await this.context.request.setQuery(modifiedQuery);
  }

  /**
   * Called when a query response is received
   */
  private async onQueryResponse(event: PluginEvent): Promise<void> {
    console.log('Query response received:', event.data);
    
    // Display response info in plugin panel
    const outputDiv = document.getElementById('plugin-output');
    if (outputDiv) {
      outputDiv.innerHTML = `
        <h4>Last Response:</h4>
        <p>Status: ${event.data.status}</p>
        <p>Response time: ${event.data.responseTime}ms</p>
        <p>Data keys: ${Object.keys(event.data.body.data || {}).join(', ')}</p>
      `;
    }
  }

  /**
   * Called when the plugin is destroyed
   */
  async destroy(): Promise<void> {
    console.log('My First Plugin destroyed');
    // Cleanup resources if needed
  }
}

// Export the plugin class
export default MyFirstPlugin;
```

### 5. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "lib": ["ES2018", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 6. Build Script

Add build scripts to `package.json`:

```json
{
  "name": "altair-graphql-plugin-my-first-plugin",
  "version": "1.0.0",
  "description": "My first Altair GraphQL Client plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["altair", "graphql", "plugin"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {
    "altair-graphql-plugin-sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^4.8.0"
  }
}
```

## Advanced Plugin Features

### 1. UI Components and Interactions

Create interactive UI components:

```typescript
export class AdvancedUIPlugin extends AltairPlugin {
  async initialize(): Promise<void> {
    // Create a more complex UI panel
    this.context.app.addSidebar({
      title: 'Advanced UI',
      icon: '⚡',
      content: this.createAdvancedPanel()
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  private createAdvancedPanel(): string {
    return `
      <div class="advanced-plugin-panel">
        <h3>Advanced Features</h3>
        
        <!-- Query templates -->
        <div class="section">
          <h4>Query Templates</h4>
          <select id="template-select" class="form-control">
            <option value="">Select a template...</option>
            <option value="users">Get Users</option>
            <option value="posts">Get Posts</option>
            <option value="user-posts">User with Posts</option>
          </select>
          <button id="load-template" class="btn btn-secondary">Load</button>
        </div>

        <!-- Query formatter -->
        <div class="section">
          <h4>Query Tools</h4>
          <button id="format-query" class="btn btn-info">Format Query</button>
          <button id="minify-query" class="btn btn-info">Minify Query</button>
        </div>

        <!-- Custom variables -->
        <div class="section">
          <h4>Quick Variables</h4>
          <input type="text" id="user-id-input" placeholder="User ID" class="form-control">
          <button id="set-user-id" class="btn btn-success">Set Variable</button>
        </div>

        <!-- Results -->
        <div id="plugin-results" class="results-section">
          <h4>Results</h4>
          <div id="results-content">No results yet...</div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Template loading
    document.getElementById('load-template')?.addEventListener('click', async () => {
      const select = document.getElementById('template-select') as HTMLSelectElement;
      const template = this.getQueryTemplate(select.value);
      if (template) {
        await this.context.request.setQuery(template);
        this.showMessage('Template loaded successfully!');
      }
    });

    // Query formatting
    document.getElementById('format-query')?.addEventListener('click', async () => {
      const currentQuery = await this.context.request.getQuery();
      const formatted = this.formatQuery(currentQuery);
      await this.context.request.setQuery(formatted);
      this.showMessage('Query formatted!');
    });

    // Variable setting
    document.getElementById('set-user-id')?.addEventListener('click', async () => {
      const input = document.getElementById('user-id-input') as HTMLInputElement;
      const userId = input.value.trim();
      if (userId) {
        await this.context.request.setVariables({ userId });
        this.showMessage(`User ID set to: ${userId}`);
        input.value = '';
      }
    });
  }

  private getQueryTemplate(templateName: string): string | null {
    const templates = {
      'users': `query GetUsers($first: Int = 10) {
        users(first: $first) {
          id
          name
          email
        }
      }`,
      'posts': `query GetPosts($first: Int = 10) {
        posts(first: $first) {
          id
          title
          content
          author {
            id
            name
          }
        }
      }`,
      'user-posts': `query GetUserWithPosts($userId: ID!) {
        user(id: $userId) {
          id
          name
          email
          posts {
            id
            title
            createdAt
          }
        }
      }`
    };

    return templates[templateName] || null;
  }

  private formatQuery(query: string): string {
    // Simple query formatting logic
    return query
      .replace(/\{/g, '{\n  ')
      .replace(/\}/g, '\n}')
      .replace(/,/g, ',\n  ')
      .replace(/\n\s*\n/g, '\n');
  }

  private showMessage(message: string): void {
    const resultsContent = document.getElementById('results-content');
    if (resultsContent) {
      resultsContent.innerHTML = `<p class="success-message">${message}</p>`;
      setTimeout(() => {
        resultsContent.innerHTML = 'No results yet...';
      }, 3000);
    }
  }
}
```

### 2. Data Processing and Transformation

Create plugins that process query responses:

```typescript
export class DataProcessorPlugin extends AltairPlugin {
  async initialize(): Promise<void> {
    this.context.events.on('query.response', this.processResponse.bind(this));
    
    this.context.app.addSidebar({
      title: 'Data Processor',
      icon: '🔄',
      content: this.createProcessorPanel()
    });
  }

  private async processResponse(event: PluginEvent): Promise<void> {
    const response = event.data.body;
    
    if (!response.data) return;

    // Process different types of data
    const processedData = {
      users: this.processUsers(response.data.users),
      posts: this.processPosts(response.data.posts),
      statistics: this.calculateStatistics(response.data)
    };

    // Display processed data
    this.displayProcessedData(processedData);
    
    // Optionally transform the response
    if (this.shouldTransformResponse()) {
      await this.context.response.setData(this.transformResponse(response));
    }
  }

  private processUsers(users: any[]): any {
    if (!Array.isArray(users)) return null;

    return {
      total: users.length,
      domains: this.getEmailDomains(users),
      recentUsers: users
        .filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length
    };
  }

  private processPosts(posts: any[]): any {
    if (!Array.isArray(posts)) return null;

    return {
      total: posts.length,
      avgLength: posts.reduce((acc, p) => acc + (p.content?.length || 0), 0) / posts.length,
      byAuthor: this.groupByAuthor(posts)
    };
  }

  private calculateStatistics(data: any): any {
    const stats = {
      totalFields: this.countFields(data),
      dataSize: JSON.stringify(data).length,
      nullFields: this.countNullFields(data),
      arrayFields: this.countArrayFields(data)
    };

    return stats;
  }

  private getEmailDomains(users: any[]): { [domain: string]: number } {
    const domains: { [domain: string]: number } = {};
    
    users.forEach(user => {
      if (user.email) {
        const domain = user.email.split('@')[1];
        domains[domain] = (domains[domain] || 0) + 1;
      }
    });

    return domains;
  }

  private groupByAuthor(posts: any[]): { [authorName: string]: number } {
    const byAuthor: { [authorName: string]: number } = {};
    
    posts.forEach(post => {
      if (post.author?.name) {
        byAuthor[post.author.name] = (byAuthor[post.author.name] || 0) + 1;
      }
    });

    return byAuthor;
  }

  private countFields(obj: any, count = 0): number {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.reduce((acc, item) => acc + this.countFields(item), count);
      } else {
        return Object.keys(obj).reduce((acc, key) => {
          return acc + 1 + this.countFields(obj[key], 0);
        }, count);
      }
    }
    return count;
  }

  private countNullFields(obj: any, count = 0): number {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.reduce((acc, item) => acc + this.countNullFields(item), count);
      } else {
        return Object.keys(obj).reduce((acc, key) => {
          return acc + (obj[key] === null ? 1 : 0) + this.countNullFields(obj[key], 0);
        }, count);
      }
    }
    return count;
  }

  private countArrayFields(obj: any, count = 0): number {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return count + 1 + obj.reduce((acc, item) => acc + this.countArrayFields(item, 0), 0);
      } else {
        return Object.keys(obj).reduce((acc, key) => {
          return acc + this.countArrayFields(obj[key], 0);
        }, count);
      }
    }
    return count;
  }

  private displayProcessedData(data: any): void {
    const content = document.getElementById('processor-content');
    if (!content) return;

    content.innerHTML = `
      <div class="processed-data">
        ${data.users ? `
          <div class="data-section">
            <h5>Users Analysis</h5>
            <p>Total: ${data.users.total}</p>
            <p>Recent (7 days): ${data.users.recentUsers}</p>
            <p>Email domains: ${Object.keys(data.users.domains).length}</p>
          </div>
        ` : ''}
        
        ${data.posts ? `
          <div class="data-section">
            <h5>Posts Analysis</h5>
            <p>Total: ${data.posts.total}</p>
            <p>Avg length: ${Math.round(data.posts.avgLength)} chars</p>
            <p>Authors: ${Object.keys(data.posts.byAuthor).length}</p>
          </div>
        ` : ''}
        
        ${data.statistics ? `
          <div class="data-section">
            <h5>Response Statistics</h5>
            <p>Total fields: ${data.statistics.totalFields}</p>
            <p>Data size: ${Math.round(data.statistics.dataSize / 1024)}KB</p>
            <p>Null fields: ${data.statistics.nullFields}</p>
            <p>Array fields: ${data.statistics.arrayFields}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  private createProcessorPanel(): string {
    return `
      <div class="processor-panel">
        <h3>Data Processor</h3>
        <p>Automatically analyzes GraphQL responses</p>
        <div id="processor-content">
          <p>Execute a query to see analysis...</p>
        </div>
      </div>
    `;
  }

  private shouldTransformResponse(): boolean {
    // Check if transformation is enabled
    return false; // Disable by default
  }

  private transformResponse(response: any): any {
    // Transform the response data
    return response;
  }
}
```

## Plugin Testing and Debugging

### 1. Local Testing Setup

Create a test environment for your plugin:

```typescript
// test/plugin.test.ts
import { MyFirstPlugin } from '../src/index';
import { createMockContext } from './mocks';

describe('MyFirstPlugin', () => {
  let plugin: MyFirstPlugin;
  let mockContext: any;

  beforeEach(() => {
    mockContext = createMockContext();
    plugin = new MyFirstPlugin(mockContext, {
      manifest_version: 2,
      name: 'Test Plugin',
      version: '1.0.0'
    });
  });

  it('should initialize without errors', async () => {
    await expect(plugin.initialize()).resolves.not.toThrow();
  });

  it('should handle query send events', async () => {
    await plugin.initialize();
    
    const event = {
      type: 'query.send-request',
      data: { query: 'query { users { id } }' }
    };

    // Test that the plugin handles the event
    expect(mockContext.request.setHeader).toHaveBeenCalledWith(
      'X-Plugin-Version', 
      '1.0.0'
    );
  });
});
```

### 2. Debug Console Integration

Add debugging capabilities to your plugin:

```typescript
export class DebuggablePlugin extends AltairPlugin {
  private debug: boolean = false;

  async initialize(): Promise<void> {
    // Check if debug mode is enabled
    this.debug = await this.context.storage.get('debug', false);
    
    this.log('Plugin initialized', { debug: this.debug });
    
    // Add debug panel
    if (this.debug) {
      this.addDebugPanel();
    }
  }

  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[${this.manifest.name}] ${message}`, data);
    }
  }

  private addDebugPanel(): void {
    this.context.app.addSidebar({
      title: 'Debug',
      icon: '🐛',
      content: `
        <div class="debug-panel">
          <h3>Plugin Debug</h3>
          <button id="toggle-debug" class="btn btn-warning">
            Toggle Debug
          </button>
          <div id="debug-log"></div>
        </div>
      `
    });

    // Setup debug event listeners
    this.setupDebugListeners();
  }

  private setupDebugListeners(): void {
    document.getElementById('toggle-debug')?.addEventListener('click', async () => {
      this.debug = !this.debug;
      await this.context.storage.set('debug', this.debug);
      this.log('Debug mode toggled', { debug: this.debug });
    });
  }
}
```

## Publishing Your Plugin

### 1. Prepare for Publishing

Update your `package.json`:

```json
{
  "name": "altair-graphql-plugin-my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin for Altair GraphQL Client",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/altair-graphql-plugin-my-awesome-plugin"
  },
  "keywords": [
    "altair",
    "graphql",
    "plugin",
    "development",
    "tools"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ]
}
```

### 2. Create Documentation

Write a comprehensive README.md:

```markdown
# My Awesome Altair Plugin

A powerful plugin that extends Altair GraphQL Client with awesome features.

## Features

- ✨ Feature 1: Description
- 🚀 Feature 2: Description
- 🔧 Feature 3: Description

## Installation

```
altair-graphql-plugin-my-awesome-plugin
```

## Usage

1. Open Altair GraphQL Client
2. Go to Settings → Plugins
3. Add the plugin name to your plugin list
4. The plugin will appear in the sidebar

## Configuration

The plugin supports the following configuration options:

- `option1`: Description (default: `value`)
- `option2`: Description (default: `value`)

## Contributing

Pull requests are welcome! Please read our contributing guide first.

## License

MIT
```

### 3. Publish to npm

```bash
# Build the plugin
npm run build

# Test the package
npm pack

# Publish to npm
npm publish
```

## Best Practices

### Plugin Development
- **Keep it simple**: Focus on one main feature per plugin
- **Error handling**: Always handle errors gracefully
- **Performance**: Avoid blocking the main thread
- **Documentation**: Write clear documentation and examples

### User Experience
- **Intuitive UI**: Make the interface easy to understand
- **Helpful feedback**: Provide clear success/error messages
- **Keyboard support**: Support keyboard navigation where possible
- **Responsive design**: Ensure UI works on different screen sizes

### Security and Privacy
- **Sandbox restrictions**: Respect Altair's security model
- **Data handling**: Be careful with sensitive data
- **External requests**: Minimize external API calls
- **User consent**: Ask permission for significant actions

### Testing and Quality
- **Unit tests**: Write tests for your plugin logic
- **Integration tests**: Test with actual Altair instances
- **Error scenarios**: Test error conditions
- **Cross-platform**: Test on different platforms

By following this tutorial and best practices, you'll be able to create powerful plugins that enhance the Altair GraphQL Client experience for yourself and the community!