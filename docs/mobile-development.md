# Mobile App Development

iOS app in `packages/mobile/` using Expo/React Native.

## Quick Start

```bash
cd packages/mobile
npm install
npx expo run:ios          # Build and run on iOS simulator
```

## E2E Testing with Maestro

```bash
maestro test .maestro/              # Run all tests
maestro test .maestro/auth_flow.yaml  # Single test
```

### Prerequisites for Tests
1. iOS Simulator running
2. App built: `npx expo run:ios`
3. Local Supabase running: `npx supabase start`
4. Test user exists: `test@example.com` / `Test1234`

## Documentation

- **Specs**: `specs/mobile/` - Architecture and API docs
- **Next features**: `specs/mobile/next-features.md` - Prioritized roadmap

## Key Files

```
packages/mobile/
├── App.tsx                      # Root with auth routing
├── src/
│   ├── lib/supabase.ts          # Supabase client
│   ├── contexts/AuthContext.tsx # Auth state
│   └── screens/
│       ├── LoginScreen.tsx
│       └── TimerScreen.tsx
└── .maestro/                    # E2E tests
```
