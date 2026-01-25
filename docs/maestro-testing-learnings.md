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

## DSButton fullWidth Prop in Row Layouts

**Problem**: `DSButton` has `fullWidth={true}` by default. When placed in a `DSRow` with other elements, the button expands to fill all remaining horizontal space, potentially overflowing off-screen.

**Solution**: Always set `fullWidth={false}` when using DSButton inside a row layout.

```tsx
// Bad - button expands to fill row, may overflow
<DSRow gap="md" style={{ alignItems: 'center' }}>
  <DSText>Label:</DSText>
  <DSTextInput containerStyle={{ width: 60 }} />
  <DSButton title="Save" size="sm" />  {/* Will expand! */}
</DSRow>

// Good - button stays compact
<DSRow gap="md" style={{ alignItems: 'center' }}>
  <DSText>Label:</DSText>
  <DSTextInput containerStyle={{ width: 60 }} />
  <DSButton title="Save" size="sm" fullWidth={false} />
</DSRow>
```

## Using the Component Showcase for UI Development

**Problem**: Iterating on UI components requires navigating through the full app flow (login, navigation, state setup).

**Solution**: Use the built-in component showcase at `src/design-system/showcase/` to develop and test UI in isolation.

**Steps to add a new showcase story:**

1. Create a story file in `src/design-system/showcase/stories/`:
```tsx
// MyComponentStories.tsx
import { StoryWrapper } from '../StoryWrapper';

export const MyComponentStories = {
  Default: () => (
    <StoryWrapper title="Default" description="Basic usage">
      <MyComponent />
    </StoryWrapper>
  ),
  WithState: () => {
    const [value, setValue] = useState('');
    return (
      <StoryWrapper title="With State" description="Interactive example">
        <MyComponent value={value} onChange={setValue} />
      </StoryWrapper>
    );
  },
};
```

2. Register in `ShowcaseScreen.tsx`:
```tsx
import { MyComponentStories } from './stories/MyComponentStories';

const STORIES = {
  // ... existing stories
  'My Component': [
    { name: 'Default', component: MyComponentStories.Default },
    { name: 'With State', component: MyComponentStories.WithState },
  ],
};
```

3. Access via "Open Component Showcase" button on login screen

**Benefits:**
- Fast iteration without login/navigation
- Mock API calls and state
- Test edge cases (long text, error states)
- Visual documentation of components

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

## Horizontal ScrollView Elements Off-Screen

**Problem**: Elements in a horizontal `ScrollView` may be off-screen and Maestro cannot tap them directly.

**Solution**: Use `swipe` with `from` targeting a visible element to scroll the container, then tap the newly visible element.

```yaml
# Ocean Depth card is visible, Sunset Warmth is off-screen to the right
- swipe:
    from:
      id: "theme-card-oceanDepth"
    direction: LEFT
    duration: 400

# Now Sunset Warmth should be visible
- tapOn:
    id: "theme-card-sunsetWarmth"
```

**Key points:**
- Use `from: id:` to target the swipe starting point on a visible element
- `direction: LEFT` scrolls content to reveal elements on the right
- Add a small `duration` (300-500ms) for reliable swipes

## Absolute Positioned Elements and Touch Events

**Problem**: TouchableOpacity with `position: absolute` placed as a sibling to full-screen content may not receive touch events reliably, even with `zIndex`.

**Symptoms:**
- Maestro reports the tap as "COMPLETED"
- The `onPress` callback never fires
- The element is visually rendered on top

**Cause**: React Native's touch event system can be affected by:
- Sibling Views that cover the same area capturing events
- SafeAreaView or other containers interfering with the touch responder chain
- The order of elements in the render tree vs. visual z-order

**Solution**: Place the absolute-positioned touchable inside the same parent View that renders the content it overlaps, rather than as a sibling.

```tsx
// Problematic - close button as sibling to content
function Screen({ onClose }) {
  return (
    <View style={{ flex: 1 }}>
      <FullScreenContent />
      <TouchableOpacity
        style={{ position: 'absolute', top: 10, right: 10 }}
        onPress={onClose}  // May not fire!
      >
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

// Better - close button inside the content component
function Screen({ onClose }) {
  return (
    <View style={{ flex: 1 }}>
      <FullScreenContent onClose={onClose} />
    </View>
  );
}

function FullScreenContent({ onClose }) {
  return (
    <View style={{ flex: 1 }}>
      {/* Close button inside same View hierarchy */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
        onPress={onClose}
      >
        <Text>Close</Text>
      </TouchableOpacity>
      {/* Rest of content */}
    </View>
  );
}
```

## Testing Theme/Style Variations

**Problem**: Need to verify multiple visual themes or style variants work correctly.

**Solution**: Create a dedicated showcase screen that allows switching between themes and use Maestro to:
1. Select each theme variant
2. Verify the theme name is displayed
3. Take screenshots for visual verification
4. Navigate between screens to test theme consistency

```yaml
# Test each theme in sequence
- tapOn:
    id: "theme-card-midnightAurora"
- assertVisible: "Midnight Aurora"
- takeScreenshot: "theme_midnight_aurora"

- tapOn:
    id: "theme-card-softBlossom"
- assertVisible: "Soft Blossom"
- takeScreenshot: "theme_soft_blossom"
```

**Tip**: Use `takeScreenshot` to capture each theme for manual visual review. Screenshots are saved to the current working directory.

## Dev Server Must Be Running

**Problem**: Maestro launches the app but shows "Could not connect to development server" error.

**Solution**: Start the Expo dev server before running Maestro tests.

```bash
# Terminal 1: Start dev server
npx expo start

# Terminal 2: Run Maestro tests (after server is ready)
maestro test .maestro/my_test.yaml
```

**Tip**: Wait for the Metro bundler to show "Logs for your project will appear below" before running tests.
