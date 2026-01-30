# Maestro E2E Tests

## Prerequisites

1. **Metro running**: Start Expo with `npx expo start`
2. **Simulator running**: iOS simulator must be booted
3. **Java 17+**: Required for Maestro CLI

## Running Tests

### Using the helper script (recommended for Dev Client)

The Expo Dev Client requires reconnection after Maestro's `launchApp`. Use the helper script:

```bash
cd packages/mobile/.maestro
chmod +x run-test.sh
./run-test.sh entry_detail_flow.yaml
```

### Direct Maestro (if app is already connected)

```bash
maestro test .maestro/entry_detail_flow.yaml
```

### Running all tests

```bash
maestro test .maestro/
```

## Test Files

| Test | Description |
|------|-------------|
| `auth_flow.yaml` | Login/logout flow |
| `history_flow.yaml` | Create timer, view history |
| `entry_detail_flow.yaml` | Tap entry, view/edit details |

## Known Issues

- **Dev Client disconnects**: Maestro's `launchApp` terminates the app, which disconnects from Metro. Use `run-test.sh` to auto-reconnect.
- **mDNS discovery**: Dev Client may not auto-discover Metro on some networks. The helper script uses direct URL connection.

## CI/CD

For CI, build a preview/release version of the app instead of using Dev Client:

```bash
eas build --profile preview --platform ios
maestro cloud --app-file=./build.ipa .maestro/
```
