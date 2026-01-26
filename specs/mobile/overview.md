# Mobile App Overview

iOS mobile app built with Expo/React Native for time tracking.

## Tech Stack

| Component      | Technology                |
|----------------|---------------------------|
| Framework      | Expo 54 / React Native    |
| Language       | TypeScript                |
| Backend        | Supabase (shared with CLI)|
| Auth Storage   | expo-secure-store         |
| E2E Testing    | Maestro                   |

## Package Location

```
packages/mobile/
├── App.tsx                    # Root component with auth routing
├── src/
│   ├── lib/supabase.ts        # Supabase client configuration
│   ├── contexts/AuthContext.tsx
│   └── screens/
│       ├── LoginScreen.tsx
│       └── TimerScreen.tsx
└── .maestro/                  # E2E tests
    ├── welcome_screen.yaml
    ├── auth_flow.yaml
    └── timer_flow.yaml
```

## App Configuration

| Setting          | Value                |
|------------------|----------------------|
| Bundle ID (iOS)  | com.anonymous.mobile |
| Supabase URL     | http://192.168.2.28:54321 (local dev) |

## Running the App

```bash
cd packages/mobile
npm install
npx expo run:ios
```

## Running Tests

```bash
# All Maestro tests
cd packages/mobile
maestro test .maestro/

# Single test
maestro test .maestro/auth_flow.yaml
```
