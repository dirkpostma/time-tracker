# Phase 6: Testing

## Unit & Component Tests

- Jest for hooks and utilities
- React Native Testing Library for components

## E2E Tests with Maestro

### Install

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Test Structure

```
packages/mobile/.maestro/
├── auth-flow.yaml
├── timer-start.yaml
└── timer-stop.yaml
```

### Example: auth-flow.yaml

```yaml
appId: com.timetracker.mobile
---
- launchApp
- assertVisible: "Sign In"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "testpassword"
- tapOn: "Sign In"
- assertVisible: "Start Timer"
```

### Example: timer-start.yaml

```yaml
appId: com.timetracker.mobile
---
- launchApp
- tapOn: "Start Timer"
- assertVisible: "Select Client"
- tapOn: "Acme Corp"
- tapOn: "Skip"
- tapOn: "Start"
- assertVisible: "Stop Timer"
```

### Run Tests

```bash
cd packages/mobile
maestro test .maestro/
```

## Polish

- Loading states
- Error handling
- Consistent styling
- README updates
