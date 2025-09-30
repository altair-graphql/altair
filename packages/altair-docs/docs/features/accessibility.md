---
parent: Features
---

# Accessibility

Altair GraphQL Client is designed to be accessible to users with diverse needs and abilities. This guide covers accessibility features and best practices for using Altair effectively.

## Keyboard Navigation

### Primary Navigation

Altair supports comprehensive keyboard navigation:

- **Tab**: Navigate through interface elements
- **Shift + Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and controls
- **Escape**: Close dialogs and modals
- **Arrow Keys**: Navigate within menus and lists

### Query Editor Shortcuts

- **Ctrl/Cmd + Enter**: Execute query
- **Ctrl/Cmd + /**: Toggle comment
- **Ctrl/Cmd + Shift + P**: Prettify/Format query
- **Ctrl/Cmd + F** or **Alt + F**: Find in editor
- **Ctrl/Cmd + D**: Jump to documentation
- **Tab**: Increase indentation
- **Shift + Tab**: Decrease indentation

### Window Management

- **Ctrl + T**: New query window
- **Ctrl + W**: Close current window
- **Ctrl + Shift + T**: Reopen closed window

### Additional Shortcuts

- **Ctrl + Shift + V**: Toggle Variables pane
- **Ctrl + Shift + H**: Toggle Headers pane
- **Ctrl + Shift + D**: Toggle Documentation pane
- **Ctrl + Shift + R**: Reload schema/docs
- **Cmd + S**: Save query to collection (macOS)
- **Ctrl + Shift + Enter**: Fill all fields at cursor

## Screen Reader Support

### ARIA Labels and Descriptions

Altair includes comprehensive ARIA attributes for screen readers:

- **Query Editor**: Labeled as "GraphQL Query Editor" with current query status
- **Variables Panel**: "GraphQL Variables Input" with validation status
- **Result Panel**: "Query Results" with response status and error information
- **Schema Documentation**: "GraphQL Schema Documentation" with current type information

### Screen Reader Announcements

Key actions trigger screen reader announcements:

- **Query Execution**: "Query sent" → "Query completed successfully" or "Query failed with errors"
- **Schema Loading**: "Schema loading" → "Schema loaded successfully"
- **Error States**: Detailed error descriptions and locations
- **Validation**: Real-time validation feedback

### Semantic Structure

Altair uses proper semantic HTML structure:

- **Headings (h1-h6)**: Hierarchical content organization
- **Landmarks**: Main content areas, navigation, and complementary information
- **Lists**: Structured presentation of schema types, fields, and errors
- **Forms**: Proper labeling of input fields and controls

## Visual Accessibility

### High Contrast Mode

Enable high contrast themes for better visibility:

1. Go to **Settings** → **Theme**
2. Select "High Contrast Light" or "High Contrast Dark"
3. Adjust font size if needed

### Color Accessibility

Altair's color scheme considerations:

- **Error States**: Red with additional icons and text indicators
- **Success States**: Green with checkmarks and descriptive text
- **Warning States**: Yellow/orange with warning icons
- **Information**: Blue with informational icons
- **Syntax Highlighting**: Distinguishable without relying solely on color

### Font and Text Settings

Customize text display for better readability:

```json
{
  "theme.fontsize": 16,
  "theme.fontFamily": "Monaco, 'Courier New', monospace",
  "theme.editorFontFamily": "Fira Code, Monaco, 'Courier New', monospace",
  "theme.lineHeight": 1.5
}
```

### Zoom Support

Altair respects browser zoom settings:
- **Browser Zoom**: Works with Ctrl/Cmd + Plus/Minus
- **Font Size**: Independent font size controls in settings
- **Interface Scaling**: Maintains layout integrity at different zoom levels

## Motor Accessibility

### Mouse Alternatives

All mouse interactions have keyboard equivalents:

- **Query Execution**: Keyboard shortcut (Ctrl/Cmd + Enter)
- **Menu Navigation**: Tab and arrow keys
- **Button Activation**: Enter or Space keys
- **Text Selection**: Shift + arrow keys
- **Copy/Paste**: Standard keyboard shortcuts

### Large Click Targets

Interface elements meet accessibility guidelines:
- **Minimum Size**: 44px × 44px for touch targets
- **Button Spacing**: Adequate spacing between interactive elements
- **Focus Indicators**: Clear visual focus indicators

### Customizable Interface

Adjust interface for motor accessibility:

```json
{
  "editor.wordWrap": true,
  "editor.lineNumbers": "on",
  "editor.minimap.enabled": false,
  "editor.scrollbar.horizontal": "auto",
  "editor.scrollbar.vertical": "auto"
}
```

## Cognitive Accessibility

### Clear Information Architecture

Altair's interface follows predictable patterns:

- **Consistent Navigation**: Same interaction patterns across features
- **Logical Grouping**: Related features grouped together
- **Progressive Disclosure**: Complex features revealed gradually
- **Clear Labels**: Descriptive text for all interface elements

### Error Prevention and Recovery

Built-in safeguards for error prevention:

- **Real-time Validation**: Immediate feedback on query syntax
- **Auto-completion**: Reduces typing errors and cognitive load
- **Undo/Redo**: Easy recovery from mistakes
- **Auto-save**: Automatic saving of work in progress

### Contextual Help

Multiple levels of assistance:

- **Tooltips**: Brief descriptions of interface elements
- **Documentation Panel**: Inline schema documentation
- **Status Messages**: Clear feedback on current state
- **Error Messages**: Specific, actionable error descriptions

## Language and Localization

### Interface Language

Altair supports multiple interface languages:

1. Go to **Settings** → **Language**
2. Select your preferred language
3. Restart Altair to apply changes

Available languages include:
- English
- Chinese (Simplified/Traditional)
- Czech
- Dutch
- French
- German
- Italian
- Japanese
- Korean
- Polish
- Portuguese
- Russian
- Spanish
- Swedish

### Right-to-Left (RTL) Support

For RTL languages, Altair automatically adjusts:
- **Text Direction**: Proper RTL text flow
- **Interface Layout**: Mirrored layout for RTL reading patterns
- **Icon Orientation**: Appropriate icon directions

## Platform-Specific Accessibility

### Desktop Application

**Windows**:
- **High Contrast Mode**: Respects Windows high contrast settings
- **Screen Reader**: Compatible with NVDA, JAWS, and Windows Narrator
- **Magnifier**: Works with Windows Magnifier
- **Voice Control**: Compatible with Windows Speech Recognition

**macOS**:
- **VoiceOver**: Full VoiceOver support
- **Zoom**: Compatible with macOS zoom features
- **Voice Control**: Works with macOS Voice Control
- **Reduce Motion**: Respects system motion preferences

**Linux**:
- **Screen Readers**: Compatible with Orca and other AT-SPI screen readers
- **High Contrast**: Respects GTK/Qt theme settings
- **Keyboard Navigation**: Full keyboard accessibility

### Browser Extensions

Browser extension accessibility features:
- **Tab Order**: Logical tab navigation within extension popup
- **Keyboard Shortcuts**: Same shortcuts as desktop application
- **Screen Reader**: Compatible with browser screen reader support
- **Zoom**: Respects browser zoom settings

### Web Application

Web app accessibility considerations:
- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Cross-browser Support**: Consistent accessibility across browsers
- **Touch Support**: Accessible on touch devices
- **Mobile Responsive**: Accessible on mobile devices

## Accessibility Settings

### Recommended Settings for Accessibility

```json
{
  "theme": "high-contrast-dark",
  "theme.fontsize": 16,
  "theme.lineHeight": 1.6,
  "editor.wordWrap": true,
  "editor.lineNumbers": "on",
  "editor.renderWhitespace": "all",
  "editor.cursorBlinking": "solid",
  "editor.cursorWidth": 3,
  "animation.enabled": false,
  "sound.enabled": true
}
```

### Motion and Animation Controls

For users sensitive to motion:

```json
{
  "animation.enabled": false,
  "transitions.enabled": false,
  "auto-scroll.enabled": false,
  "smooth-scrolling.enabled": false
}
```

## Testing Accessibility

### Screen Reader Testing

To test Altair with screen readers:

1. **Enable Screen Reader**: Turn on your preferred screen reader
2. **Navigate Interface**: Use Tab key to navigate through elements
3. **Test Query Workflow**: Execute complete query workflow using only keyboard
4. **Verify Announcements**: Ensure important state changes are announced

### Keyboard-Only Testing

Test complete functionality without mouse:

1. **Disconnect Mouse**: Temporarily disable mouse/trackpad
2. **Complete Tasks**: Perform all common tasks using only keyboard
3. **Check Focus Indicators**: Ensure focus is always visible
4. **Test All Features**: Verify every feature is keyboard accessible

### Color Accessibility Testing

Verify color accessibility:

1. **Use Color Blindness Simulators**: Test with different color vision types
2. **High Contrast Mode**: Verify functionality in high contrast modes
3. **Grayscale Testing**: Ensure information is conveyed without color
4. **Sufficient Contrast**: Check color contrast ratios meet WCAG guidelines

## Reporting Accessibility Issues

### How to Report Issues

If you encounter accessibility barriers:

1. **GitHub Issues**: Report accessibility bugs at [https://github.com/altair-graphql/altair/issues](https://github.com/altair-graphql/altair/issues)
2. **Include Details**: Provide specific information about the accessibility barrier
3. **Environment Information**: Include your platform, assistive technology, and settings
4. **Steps to Reproduce**: Clear steps that demonstrate the issue

### Information to Include

When reporting accessibility issues:

- **Platform**: Desktop app, browser extension, or web app
- **Operating System**: Version and accessibility settings
- **Assistive Technology**: Screen reader, magnifier, or other AT used
- **Browser**: Type and version (for web app/extension)
- **Specific Issue**: Clear description of the accessibility barrier
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens

## Accessibility Resources

### Learning Resources

- **Web Content Accessibility Guidelines (WCAG)**: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- **Screen Reader Testing**: Platform-specific screen reader documentation
- **Keyboard Navigation Patterns**: ARIA Authoring Practices Guide

### Community Support  

- **GitHub Discussions**: [https://github.com/altair-graphql/altair/discussions](https://github.com/altair-graphql/altair/discussions)
- **Accessibility Forum**: Share tips and ask questions about accessibility
- **Feature Requests**: Suggest accessibility improvements

Altair is committed to providing an accessible GraphQL development experience for all users. We continuously work to improve accessibility features and welcome feedback from the community to make Altair more inclusive.