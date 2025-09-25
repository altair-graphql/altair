# Altair GraphQL Client - Tauri Edition

This is the Tauri-based desktop application for Altair GraphQL Client. It provides a modern, lightweight alternative to the Electron version.

## Features

- **Smaller bundle size**: Tauri uses the system's WebView instead of bundling Chromium
- **Lower memory usage**: More efficient resource utilization
- **Better security**: Rust backend with secure IPC
- **Native performance**: Rust-based backend for better performance

## Development

### Prerequisites

- Rust (latest stable)
- Node.js 20+
- pnpm

### Running in Development

```bash
# From the repository root
pnpm start:tauri
```

Or from this directory:

```bash
pnpm dev
```

### Building

```bash
# From the repository root
pnpm build-tauri
```

Or from this directory:

```bash
pnpm build
```

## Architecture

### Backend (Rust)

The `src-tauri/` directory contains the Rust backend that provides:

- Window management
- File system operations
- System integration
- Auto-updater
- Native notifications
- Secure storage

### Frontend Integration

The frontend uses the `@altairgraphql/tauri-interop` package to communicate with the Rust backend through Tauri's IPC system.

### Key Components

1. **Main Rust Application** (`src-tauri/src/main.rs`):
   - Sets up the Tauri application
   - Defines command handlers for IPC
   - Manages application state

2. **Tauri Interop Layer** (`../altair-tauri-interop/`):
   - TypeScript bindings for Tauri commands
   - Event listeners for system events
   - Storage abstraction

3. **Desktop Service Layer** (`../altair-app/src/app/modules/altair/services/desktop-app/`):
   - Unified interface for both Electron and Tauri
   - Automatic detection of runtime environment
   - Seamless API switching

## Migration from Electron

The Tauri implementation provides equivalent functionality to the Electron version:

| Feature | Electron | Tauri |
|---------|----------|-------|
| Window Management | ✅ | ✅ |
| File Operations | ✅ | ✅ |
| Settings Storage | electron-store | Tauri Store Plugin |
| Auto Updates | electron-updater | Tauri Updater Plugin |
| System Integration | Native APIs | Tauri Plugins |
| Custom Protocols | protocol.handle | Custom schemes |
| Menu System | Electron Menu | Tauri Menu |

## Configuration

The Tauri application is configured through `src-tauri/tauri.conf.json`:

- **Bundle settings**: App metadata and packaging options
- **Window properties**: Default window size, decorations, etc.
- **Security settings**: CSP, allowed origins
- **Plugin configuration**: Feature flags and permissions

## Build Artifacts

When built, the Tauri application generates platform-specific bundles:

- **Windows**: MSI installer and executable
- **macOS**: DMG and app bundle
- **Linux**: AppImage, DEB, and RPM packages

## Benefits over Electron

1. **Size**: ~10-50MB vs ~100-200MB for Electron apps
2. **Memory**: Uses system WebView instead of bundled Chromium
3. **Security**: Rust memory safety + secure IPC model
4. **Performance**: Native code backend with minimal overhead
5. **System Integration**: Better native look and feel

## Current Status

This Tauri implementation provides:

- ✅ Core IPC commands and events
- ✅ Window management
- ✅ File operations (import/export)
- ✅ Settings persistence
- ✅ Auto-backup functionality
- ✅ Header injection for requests
- ✅ Authentication token handling
- ✅ Notification system
- ✅ Application lifecycle management

### Future Enhancements

- Custom protocol handling (altair://)
- Menu system and keyboard shortcuts
- Advanced window state management
- Plugin system integration
- Theme support
- Multi-language support

## Testing

To test the Tauri integration:

1. Ensure the frontend builds successfully
2. Run the Tauri development server
3. Verify all IPC commands work correctly
4. Test file operations and settings persistence
5. Validate window management features

## Contributing

When contributing to the Tauri implementation:

1. Follow Rust best practices for the backend code
2. Ensure TypeScript type safety in the interop layer
3. Maintain API compatibility with the Electron version
4. Add tests for new functionality
5. Update documentation as needed

## Troubleshooting

### Common Issues

1. **Rust toolchain**: Ensure latest stable Rust is installed
2. **WebView requirements**: Some Linux distributions require additional WebView packages
3. **Build errors**: Check that all dependencies are properly installed
4. **IPC failures**: Verify command names match between frontend and backend

### Debugging

- Use `console.log` in the frontend as usual
- Rust backend logs appear in the terminal during development
- Enable Tauri devtools for additional debugging capabilities