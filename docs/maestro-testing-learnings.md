# Maestro Testing Learnings

Common issues and solutions discovered while debugging Maestro tests for the mobile app.

## Keyboard Blocks Button Taps

**Problem**: On iOS, the keyboard can cover submit buttons, causing `tapOn` to fail silently or miss the button.

**Solution**: Always use `hideKeyboard` before tapping submit buttons after text input.

```yaml
- tapOn:
    id: "text-input"
- inputText: "some value"
- hideKeyboard          # <-- Always add this
- tapOn:
    text: "Submit"
```

## Text Inside TouchableOpacity Not Accessible

**Problem**: Maestro cannot tap on `<Text>` elements nested inside `<TouchableOpacity>` or `<Pressable>` using text matching.

**Solution**: Add `accessibilityLabel` to the touchable component and tap using that text.

```tsx
// React Native component
<Pressable
  onPress={handleSubmit}
  testID="submit-button"
  accessibilityRole="button"
  accessibilityLabel="Add client"  // <-- Add this
>
  <Text>Add</Text>
</Pressable>
```

```yaml
# Maestro test - tap by accessibility label text
- tapOn:
    text: "Add client"
```

## Timer State Affects Test Flow

**Problem**: Tests may fail if a timer is already running from a previous test or session. The start-button won't be visible when the stop-button is shown.

**Solution**: Always stop any running timer at the start of tests and use `optional: true` for the tap.

```yaml
# Stop any existing running timer first
- tapOn:
    id: "stop-button"
    optional: true

# Wait for start button
- extendedWaitUntil:
    visible:
      id: "start-button"
    timeout: 10000
```

## Auto-Start Behavior After Selection

**Problem**: In this app, after selecting/creating a client and skipping project/task, the timer starts automatically. Tests expecting to tap start-button will fail.

**Solution**: Make start-button tap optional when the timer may auto-start.

```yaml
# Timer may auto-start after selection flow
- tapOn:
    id: "start-button"
    optional: true

# Wait for running state regardless of how it started
- extendedWaitUntil:
    visible:
      id: "stop-button"
    timeout: 10000
```

## Keyboard Management

**Recommendation**: Use `react-native-keyboard-controller` to manage keyboard behavior in the app. This provides better control over keyboard dismissal, avoidance, and animations compared to the built-in `KeyboardAvoidingView`.

Benefits:
- Smoother keyboard animations
- Better control over when keyboard dismisses
- Helps prevent keyboard-related UI issues that cause test flakiness

## Controlled vs Uncontrolled Inputs

**Problem**: Using `useRef` for TextInput values can cause issues where Maestro inputs text but the value isn't captured by the component's submit handler.

**Solution**: Use controlled inputs with `useState` for form fields that Maestro will interact with.

```tsx
// Good - controlled input
const [name, setName] = useState('');

<TextInput
  value={name}
  onChangeText={setName}
  testID="name-input"
/>

// Avoid - uncontrolled with ref
const inputRef = useRef<TextInput>(null);
```

## Testing Components in Isolation

**Problem**: Full flow tests require login, navigation, and state setup - slow iteration when debugging UI issues.

**Solution**: Use a showcase/storybook screen with mock data for isolated component testing.

1. Create story components in `src/design-system/showcase/stories/`
2. Add testIDs to showcase navigation elements
3. Write focused Maestro tests that navigate directly to the showcase

```yaml
# Example: showcase_add_client.yaml
- launchApp
- tapOn:
    id: "showcase-button"
- tapOn:
    id: "category-forms"
- tapOn:
    id: "story-add-client"
# Now test the isolated component
```

## Parallel Test Interference

**Problem**: Tests running in parallel can interfere with each other if they share state (e.g., running timers, saved selections).

**Solution**:
- Use `clearKeychain: true` in `launchApp` to reset auth state
- Stop timers at test start
- Create unique test data (use `inputRandomText` for names)

```yaml
- launchApp:
    clearKeychain: true

# Create unique client name
- inputRandomText:
    length: 6
- inputText: " TestSuffix"
```

## Debugging Failed Tests

1. Check screenshots in `~/.maestro/tests/[timestamp]/`
2. Read `maestro.log` for detailed step-by-step execution
3. Look for `WARNED` steps - these are optional steps that failed (may indicate unexpected state)
4. The screenshot at failure shows exactly what the UI looked like

## Quick Reference: Required Accessibility Props

For Maestro-testable buttons with text:
```tsx
<Pressable
  onPress={handler}
  testID="button-id"           // For id-based selection
  accessibilityRole="button"   // For screen readers
  accessibilityLabel="Action"  // For text-based selection in Maestro
>
```
