# Migration from Electron to Tauri - Implementation Guide

This document describes the technical implementation of migrating Altair GraphQL Client from Electron to Tauri.

## Overview

The migration maintains all existing functionality while providing the benefits of a Rust-based backend and smaller bundle size. The implementation uses a layered approach that allows both Electron and Tauri versions to coexist.

## Architecture Changes

### Before (Electron Only)

```
┌─────────────────┐
│   Frontend App  │
│   (Angular)     │
├─────────────────┤
│ ElectronAppSrvc │
├─────────────────┤
│ electron-interop│
├─────────────────┤
│ Electron Main   │
│ Process (Node)  │
└─────────────────┘
```

### After (Electron + Tauri)

```
┌─────────────────┐
│   Frontend App  │
│   (Angular)     │
├─────────────────┤
│ DesktopAppSrvc  │ ← Unified service layer
├─────┬───────────┤
│Elect│  Tauri    │
│ron  │  App      │
│App  │  Service  │
│Srvc │           │
├─────┼───────────┤
│elect│  tauri    │
│ron- │  -interop │
│inter│           │
│op   │           │
├─────┼───────────┤
│Elect│  Tauri    │
│ron  │  Backend  │
│Main │  (Rust)   │
└─────┴───────────┘
```

## Key Components

### 1. Desktop Abstraction Layer

The `DesktopAppService` provides a unified interface that automatically detects the runtime environment and delegates to the appropriate implementation:

```typescript
// Unified API that works with both Electron and Tauri
export class DesktopAppService {
  connect(options: ConnectOptions) {
    if (isElectronApp()) {
      this.electronAppService.connect(options);
    } else if (isTauriApp()) {
      this.tauriAppService.connect(options);
    }
  }
}
```

### 2. Environment Detection

Runtime environment detection allows the same frontend code to work in both Electron and Tauri:

```typescript
export const isTauriApp = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export const detectEnvironment = () => {
  if (isTauriApp()) return 'tauri';
  if (isElectronApp()) return 'electron';
  // ... other environments
};
```

### 3. IPC Command Mapping

Commands are mapped between the two systems to maintain API compatibility:

| Functionality | Electron IPC | Tauri Command |
|---------------|--------------|---------------|
| File Import | `import-file` | `import_file` |
| Settings Save | `save-settings` | `update_altair_app_settings_on_file` |
| Window Create | `create-window` | `create_new_window` |
| Headers Set | `set-headers` | `set_headers` |

### 4. Storage Abstraction

Both systems provide persistent storage with a unified interface:

```typescript
// Works with both electron-store and Tauri store plugin
storage: {
  async getItem(key: string): Promise<string | null>;
  async setItem(key: string, value: string): Promise<void>;
  async removeItem(key: string): Promise<void>;
  // ... other methods
}
```

## Implementation Details

### Rust Backend (Tauri)

The Tauri backend implements all the functionality previously handled by Electron's main process:

```rust
// Tauri command handlers
#[command]
async fn import_file() -> Result<Option<String>, String> {
  // File dialog and reading logic
}

#[command]  
async fn set_headers(headers: HeaderState) -> Result<(), String> {
  // Header management logic
}
```

### TypeScript Interop Layer

The interop layer provides type-safe access to Tauri commands:

```typescript
export const tauriApi = {
  actions: {
    async importFile(): Promise<string | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke('import_file');
      }
      return null;
    }
  }
};
```

### Service Integration

The main application services use the desktop abstraction:

```typescript
export class GqlService {
  setHeaders(headers: HeaderState) {
    // Before: this.electronAppService.setHeaders(headers);
    // After: 
    this.desktopAppService.setHeaders(headers);
  }
}
```

## Migration Benefits

### Bundle Size Reduction
- **Electron**: ~120-200MB (includes Chromium)
- **Tauri**: ~15-40MB (uses system WebView)

### Memory Usage
- **Electron**: High (Node.js + Chromium processes)
- **Tauri**: Lower (single process + system WebView)

### Security
- **Electron**: Node.js context access, broader attack surface
- **Tauri**: Rust memory safety, restricted IPC, smaller attack surface

### Performance
- **Electron**: JavaScript/Node.js backend
- **Tauri**: Compiled Rust backend with better performance characteristics

## Compatibility Matrix

| Feature | Electron Support | Tauri Support | Status |
|---------|------------------|---------------|--------|
| Window Management | ✅ | ✅ | Complete |
| File Operations | ✅ | ✅ | Complete |
| Storage/Persistence | ✅ | ✅ | Complete |
| Auto Updates | ✅ | ✅ | Implemented |
| Custom Protocols | ✅ | 🚧 | Planned |
| Menu System | ✅ | 🚧 | Planned |
| Keyboard Shortcuts | ✅ | 🚧 | Planned |
| System Notifications | ✅ | ✅ | Complete |
| Authentication | ✅ | ✅ | Complete |
| Header Injection | ✅ | ✅ | Complete |

## Build Process

### Development
```bash
# Electron
pnpm start:electron

# Tauri  
pnpm start:tauri
```

### Production Build
```bash
# Electron
pnpm build-electron

# Tauri
pnpm build-tauri
```

### Distribution
- **Electron**: Uses electron-builder for packaging
- **Tauri**: Uses built-in bundling with platform-specific installers

## Testing Strategy

### Unit Tests
- Service layer tests work for both implementations
- Mock the desktop service for isolated testing
- Verify command mapping between systems

### Integration Tests
- Test actual IPC communication in both environments
- Verify file operations work correctly
- Validate settings persistence

### End-to-End Tests
- Run the same test suite against both Electron and Tauri builds
- Verify user workflows work identically
- Performance and memory usage comparisons

## Deployment Strategy

### Phase 1: Parallel Development
- Both Electron and Tauri versions available
- Users can choose their preferred version
- Gather feedback and identify issues

### Phase 2: Tauri as Primary
- Tauri becomes the default recommendation
- Electron version maintained for compatibility
- Focus development on Tauri features

### Phase 3: Electron Deprecation
- Eventually phase out Electron version
- Migrate all users to Tauri
- Reduce maintenance overhead

## Future Enhancements

### Custom Protocol Handler
```rust
// Tauri implementation for altair:// URLs
app.handle().plugin(
  tauri_plugin_shell::Builder::default()
    .protocol("altair", |url| {
      // Handle altair:// protocol URLs
    })
    .build()
)
```

### Native Menu System
```rust
// Tauri native menu implementation
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

let menu = Menu::new()
  .add_submenu(Submenu::new("File", Menu::new()
    .add_item(CustomMenuItem::new("new", "New Window"))
    .add_item(CustomMenuItem::new("import", "Import"))
  ));
```

### Plugin System Integration
```rust
// Bridge for existing Altair plugins
#[command]
async fn load_plugin(plugin_code: String) -> Result<(), String> {
  // Load and execute plugin in secure context
}
```

## Troubleshooting

### Common Migration Issues

1. **IPC Command Mismatch**: Ensure command names match between frontend calls and Rust handlers
2. **Type Mismatches**: Verify data structures match between TypeScript and Rust
3. **Async Handling**: Properly handle Promise-based APIs in the interop layer
4. **Environment Detection**: Ensure runtime detection works correctly in all scenarios

### Development Tips

1. Use TypeScript strict mode to catch type issues early
2. Implement comprehensive error handling in Rust commands
3. Test both happy path and error scenarios
4. Use Rust's type system to prevent runtime errors
5. Validate all user inputs in the Rust backend

This migration provides a modern, efficient foundation for Altair GraphQL Client while maintaining full compatibility with existing functionality.