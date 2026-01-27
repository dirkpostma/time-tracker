# App Store Screenshots

Place screenshots in the appropriate device folder.

## Required Screenshots

### 6.7/ (iPhone 17 Pro Max - 1320×2868)

This is the primary required size for App Store (6.9" display). App Store will scale for older devices.

| File | Description |
|------|-------------|
| `01_login.png` | Login screen |
| `02_timer_stopped.png` | Timer screen with client/project selected |
| `03_timer_running.png` | Timer actively running |
| `04_history.png` | History screen with multiple entries |
| `05_settings.png` | Settings screen showing theme options |

### 6.5/ (iPhone XS Max/11 Pro Max - 1242×2688)

Alternative smaller size, optional. Requires older iOS runtime.

### ipad/ (iPad Pro 12.9" - 2048×2732)

Same screenshots, required since app supports tablet.

| File | Description |
|------|-------------|
| `01_login.png` | Login screen |
| `02_timer_stopped.png` | Timer screen with client/project selected |
| `03_timer_running.png` | Timer actively running |
| `04_history.png` | History screen with multiple entries |
| `05_settings.png` | Settings screen showing theme options |

## Capture Instructions

### Automated (Recommended)

Use Maestro to capture all screenshots automatically:

```bash
cd packages/mobile

# 1. Start the dev server
npx expo start

# 2. Open iPhone 17 Pro Max simulator (1320×2868)
xcrun simctl boot "iPhone 17 Pro Max" 2>/dev/null || true
open -a Simulator

# 3. Run the screenshot flow
maestro test .maestro/appstore_screenshots.yaml

# Screenshots saved to specified output directory
```

#### For iPad Screenshots

```bash
cd packages/mobile

# 1. Start the dev server
npx expo start

# 2. Build and install on iPad Pro 13-inch simulator
npx expo run:ios --device "iPad Pro 13-inch (M5)"

# 3. Set clean status bar
xcrun simctl status_bar "iPad Pro 13-inch (M5)" override --time "9:41" --batteryState charged --batteryLevel 100

# 4. Run the iPad screenshot flow
IPAD_UDID=$(xcrun simctl list devices | grep "iPad Pro 13-inch" | grep -o '[A-F0-9-]\{36\}')
maestro test --device "$IPAD_UDID" \
  --test-output-dir screenshots/ipad \
  .maestro/appstore_screenshots_ipad.yaml

# 5. Move and resize screenshots
mv screenshots/ipad/screenshots/*.png screenshots/ipad/
rm -rf screenshots/ipad/screenshots screenshots/ipad/2026-*

# 6. Resize to exact App Store dimensions (2048x2732)
for f in screenshots/ipad/*.png; do
  sips -z 2732 2048 "$f" --out "$f"
done
```

### Manual

1. Run app on iPhone 17 Pro Max simulator
2. Press Cmd+S to capture
3. Move screenshots to `screenshots/6.7/`

See APP_STORE_SUBMISSION.md for detailed instructions.
