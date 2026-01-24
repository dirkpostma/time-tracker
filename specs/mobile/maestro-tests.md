# Maestro E2E Tests Spec

## Overview

E2E tests use Maestro to automate iOS simulator interactions.

## Test Files

| File                 | Purpose                          |
|----------------------|----------------------------------|
| `welcome_screen.yaml`| Verify login screen appears      |
| `auth_flow.yaml`     | Test login and logout            |
| `timer_flow.yaml`    | Test start/stop timer            |

## Common Patterns

### App Launch
```yaml
- launchApp:
    clearState: true      # Clear app data
    clearKeychain: true   # Clear stored credentials
```

### Dismiss System Dialogs
```yaml
# Expo Go dialog
- tapOn:
    text: "Cancel"
    optional: true

# iOS password save dialog
- tapOn:
    text: "Not Now"
    optional: true
```

### Element Selection

By testID (preferred):
```yaml
- tapOn:
    id: "login-button"
```

By text:
```yaml
- assertVisible: "Time Tracker"
```

### Waiting for Elements
```yaml
- extendedWaitUntil:
    visible:
      id: "timer-display"
    timeout: 30000
```

## welcome_screen.yaml

Verifies unauthenticated users see login screen.

| Step | Action                    | Expected                    |
|------|---------------------------|-----------------------------|
| 1    | Launch app (clear state)  | App starts                  |
| 2    | Wait for load             | "Time Tracker" visible      |
| 3    | Assert                    | "Sign in to continue" shown |

## auth_flow.yaml

Tests complete authentication flow.

| Step | Action                    | Expected                    |
|------|---------------------------|-----------------------------|
| 1    | Launch app (clear state)  | Login screen shown          |
| 2    | Enter email               | Email in field              |
| 3    | Enter password            | Password in field           |
| 4    | Tap Login                 | Auth request sent           |
| 5    | Dismiss password dialog   | Dialog closed               |
| 6    | Wait for timer screen     | Timer display visible       |
| 7    | Assert logged in          | Logout button, email shown  |
| 8    | Tap Logout                | Session cleared             |
| 9    | Wait for login screen     | "Sign in to continue" shown |

## timer_flow.yaml

Tests timer start/stop functionality.

| Step | Action                    | Expected                    |
|------|---------------------------|-----------------------------|
| 1    | Launch app, login         | Timer screen shown          |
| 2    | Assert initial state      | Start button visible        |
| 3    | Tap Start                 | Timer starts                |
| 4    | Assert running state      | Stop button, client visible |
| 5    | Wait briefly              | Timer increments            |
| 6    | Tap Stop                  | Timer stops                 |
| 7    | Assert stopped state      | Start button visible again  |

## Running Tests

```bash
# All tests
maestro test .maestro/

# Single test
maestro test .maestro/auth_flow.yaml

# With debug output
maestro test .maestro/auth_flow.yaml --debug-output ./debug
```

## Test Prerequisites

1. iOS Simulator running
2. App built and installed: `npx expo run:ios`
3. Local Supabase running: `npx supabase start`
4. Test user exists: `test@example.com` / `Test1234`
