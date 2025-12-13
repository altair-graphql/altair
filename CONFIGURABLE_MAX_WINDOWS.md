# Configurable Maximum Windows Feature

## Overview

This feature makes the maximum window limit configurable through the application's settings, addressing the limitation of hardcoded values (50 for Electron, 15 for Web) in the codebase.

## Changes Made

### 1. Core Type Definition

**File**: `packages/altair-core/src/types/state/settings.interfaces.ts`

Added a new optional property to the `SettingsState` interface:

```typescript
/**
 * Maximum number of windows/tabs allowed
 * @default 50 (Electron), 15 (Web)
 */
maxWindows?: number;
```

This property allows users to override the default maximum window limits based on their workflow needs and hardware capabilities.

### 2. Settings Reducer Update

**File**: `packages/altair-app/src/app/modules/altair/store/settings/settings.reducer.ts`

Updated the `getInitialState()` function to include the default `maxWindows` value from `AltairConfig`:

```typescript
export const getInitialState = (): SettingsState => {
  const altairConfig = getAltairConfig();
  const initialSettings = altairConfig.initialData.settings ?? {};
  return {
    theme: altairConfig.defaultTheme,
    language: <SettingsLanguage>altairConfig.default_language,
    addQueryDepthLimit: altairConfig.add_query_depth_limit,
    tabSize: altairConfig.tab_size,
    maxWindows: altairConfig.max_windows, // NEW
    ...initialSettings,
  };
};
```

This ensures that the default value from `AltairConfig` (50 for Electron, 15 for Web) is used unless overridden by the user.

### 3. Window Switcher Component

**File**: `packages/altair-app/src/app/modules/altair/components/window-switcher/window-switcher.component.ts`

Changed `maxWindowCount` from a class property initialized with `AltairConfig` to an input signal that receives the value from settings:

```typescript
// Before:
maxWindowCount = this.altairConfig.max_windows;

// After:
readonly maxWindowCount = input(this.altairConfig.max_windows);
```

This allows the component to reactively update when the setting changes.

### 4. Header Component Template

**File**: `packages/altair-app/src/app/modules/altair/components/header/header.component.html`

Added the `maxWindowCount` binding to pass the setting value to the window switcher:

```html
<app-window-switcher
  [windows]="windows()"
  [windowIds]="windowIds()"
  [activeWindowId]="activeWindowId()"
  [closedWindows]="closedWindows()"
  [isElectron]="isElectron()"
  [collections]="collections()"
  [enableScrollbar]="settings()?.enableTablistScrollbar"
  [maxWindowCount]="settings()?.maxWindows"  <!-- NEW -->
  (newWindowChange)="newWindowChange.emit($event)"
  ...
/>
```

### 5. Internationalization

**File**: `packages/altair-app/src/assets/i18n/en-US.json`

Added a translation key for the setting label:

```json
"SETTINGS_MAX_WINDOWS_TEXT": "Maximum Windows"
```

### 6. Tests

**File**: `packages/altair-app/src/app/modules/altair/store/settings/settings.spec.ts`

Updated all test cases to include the `maxWindows` property in the mock configuration and expected results:

- Added `max_windows: 15` to the mock `AltairConfig`
- Updated all test expectations to include `maxWindows: 15` (or `maxWindows: 50` for Electron tests)

## How to Use

### For End Users

1. Open Altair GraphQL Client
2. Navigate to Settings (gear icon in the header)
3. In the settings JSON editor, add or modify the `maxWindows` property:

```json
{
  "theme": "dark",
  "language": "en-US",
  "maxWindows": 100,  // Set your desired limit
  ...
}
```

4. Click Save

The new limit will take effect immediately, allowing you to open more (or fewer) windows based on your preference.

### For Developers/Integrators

When embedding Altair or initializing it programmatically, you can set the initial maximum windows:

```typescript
new AltairConfig({
  initialSettings: {
    maxWindows: 75  // Custom limit
  }
})
```

Or use persisted settings:

```typescript
new AltairConfig({
  persistedSettings: {
    maxWindows: 100  // This will override user settings
  }
})
```

## Default Values

- **Electron**: 50 windows (unchanged)
- **Web**: 15 windows (unchanged)

These defaults remain in `packages/altair-core/src/config/index.ts` and are applied automatically if the user doesn't specify a custom value.

## Validation

The feature currently doesn't include explicit validation for the `maxWindows` value. Users should:

- Use reasonable positive integers (e.g., 1-200)
- Consider their system's memory and performance capabilities
- Avoid setting the value too low (minimum 1 is recommended)

Future enhancements could include:
- Min/max validation in the settings UI
- Performance warnings for very high values
- Automatic adjustment based on system resources

## Benefits

1. **Flexibility**: Power users can increase limits for complex workflows
2. **Performance**: Users with limited resources can decrease limits
3. **Customization**: Different environments can have different optimal limits
4. **Future-proof**: Easy to adjust as hardware capabilities improve

## Backward Compatibility

This change is fully backward compatible:

- Existing installations will use the default values
- No breaking changes to the API
- Settings files without `maxWindows` will work as before
- The feature is opt-in through settings

## Next Steps

To fully enable this feature in the UI:

1. Run `pnpm bootstrap` to build the TypeScript packages
2. Run `pnpm test` to ensure all tests pass
3. Test the feature manually in both Electron and Web environments
4. Consider adding a UI control in the settings dialog for easier configuration
5. Add validation rules to prevent unreasonable values
6. Update user documentation

## Related Files

- `packages/altair-core/src/config/index.ts` - Original hardcoded limits
- `packages/altair-core/src/types/state/settings.interfaces.ts` - Settings interface
- `packages/altair-app/src/app/modules/altair/store/settings/settings.reducer.ts` - Settings state management
- `packages/altair-app/src/app/modules/altair/components/window-switcher/window-switcher.component.ts` - Component that uses the limit
- `packages/altair-app/src/app/modules/altair/components/window-switcher/window-switcher.component.html` - Template that checks the limit
- `packages/altair-app/src/app/modules/altair/components/header/header.component.html` - Passes setting to component
