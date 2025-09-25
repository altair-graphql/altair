# TouchBar Docs Button Feature

## Overview
This feature addresses GitHub issue [link] by implementing a dynamic TouchBar button that shows "Hide Docs" when the documentation panel is visible, and "Show Docs" when it's hidden.

## Changes Made

### 1. IPC Communication (`packages/altair-electron-interop/`)
- **constants.ts**: Added `RENDERER_DOCS_STATE_CHANGED` IPC event constant
- **api.ts**: Added `setDocsStateChanged(docsVisible: boolean)` method for renderer-to-main communication

### 2. TouchBar Implementation (`packages/altair-electron/src/app/touchbar.ts`)
```typescript
export class TouchbarManager {
  private docsButton: Electron.TouchBarButton;
  private docsVisible = false;

  // Creates TouchBar with dynamic docs button
  createTouchBar() { ... }
  
  // Updates button label based on docs visibility
  updateDocsButtonState(docsVisible: boolean) {
    if (!this.docsButton) return;
    this.docsButton.label = docsVisible ? 'Hide Docs' : 'Show Docs';
  }
}
```

### 3. Main Process Listener (`packages/altair-electron/src/app/window.ts`)
```typescript
ipcMain.on(IPC_EVENT_NAMES.RENDERER_DOCS_STATE_CHANGED, (e, docsVisible: boolean) => {
  if (this.touchbarManager) {
    this.touchbarManager.updateDocsButtonState(docsVisible);
  }
});
```

### 4. Renderer State Tracking (`packages/altair-app/src/app/modules/altair/services/electron-app/electron-app.service.ts`)
```typescript
// Subscribe to docs state changes for the active window
this.store
  .select(/* active window and docs state */)
  .pipe(
    map(/* extract docs visibility */),
    distinctUntilChanged()
  )
  .subscribe((docsVisible) => {
    if (isElectronApp() && this.api) {
      this.api.actions.setDocsStateChanged(docsVisible);
    }
  });
```

## How It Works

1. **State Monitoring**: The Angular app monitors the docs state for the active window using Redux selectors
2. **Change Detection**: Only when the docs visibility actually changes, an IPC message is sent
3. **TouchBar Update**: The main Electron process receives the state change and updates the TouchBar button label
4. **User Feedback**: Users see "Show Docs" or "Hide Docs" based on actual panel visibility

## Testing

The implementation has been validated with comprehensive logic tests:

### TouchBar Logic Test
```javascript
// Tests button label changes correctly
touchbarManager.updateDocsButtonState(true);  // Shows "Hide Docs"
touchbarManager.updateDocsButtonState(false); // Shows "Show Docs"
```

### State Subscription Test
```javascript
// Tests that state changes trigger appropriate API calls
// Window 1: docs hidden → visible → hidden
// Window 2: docs visible (when switching windows)
// Result: API calls made at correct times with correct values
```

## Usage

Once the changes are compiled and the Electron app is started:

1. Open Altair GraphQL Client on macOS with TouchBar
2. The TouchBar will show "Show Docs" button initially
3. Click "Show Docs" (either in UI or TouchBar) to open documentation
4. TouchBar button will change to "Hide Docs"
5. Click "Hide Docs" (either in UI or TouchBar) to close documentation
6. TouchBar button will change back to "Show Docs"

## Building and Testing

To build the changes:
```bash
# Build required packages
pnpm bootstrap

# Or build individual packages
cd packages/altair-electron-interop && pnpm build
cd packages/altair-electron && pnpm compile
cd packages/altair-app && pnpm build
```

To test the Electron app:
```bash
cd packages/altair-electron
pnpm dev
```

## Notes

- The feature only works on macOS devices with TouchBar
- Changes are minimal and focused - no existing functionality is affected
- The implementation uses existing state management patterns from the codebase
- Error handling ensures uninitialized buttons don't cause crashes
- Performance is optimized with `distinctUntilChanged()` to avoid unnecessary IPC calls

## Files Modified

1. `packages/altair-electron-interop/src/constants.ts`
2. `packages/altair-electron-interop/src/api.ts`
3. `packages/altair-electron/src/app/touchbar.ts`
4. `packages/altair-electron/src/app/window.ts`
5. `packages/altair-app/src/app/modules/altair/services/electron-app/electron-app.service.ts`

## Test Files Added

1. `packages/altair-electron/src/app/touchbar.spec.ts` - Comprehensive TouchBar unit tests