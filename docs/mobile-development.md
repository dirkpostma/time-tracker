# Mobile App Development

iOS app in `packages/mobile/` using Expo/React Native.

## Quick Start

```bash
cd packages/mobile
cp .env.example .env      # Configure environment
npm install
npx expo run:ios          # Build and run on iOS simulator
```

## Environment Variables

Uses Expo's native `EXPO_PUBLIC_*` convention. See [Expo docs](https://docs.expo.dev/eas/environment-variables/).

### Local Development

Create `packages/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://192.168.x.x:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
```

> Use your machine's IP (not localhost) for iOS simulator to reach local Supabase.

### EAS Build (Cloud Builds)

Set environment variables per environment in EAS:

```bash
# Create variables for each environment
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "http://dev.supabase.co" --environment development
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://acc.supabase.co" --environment preview
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://prod.supabase.co" --environment production

# Same for other variables
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "key" --environment production

# List all variables
eas env:list

# Build with specific environment
eas build --profile production --platform ios
```

### Accessing in Code

```typescript
import { env } from './lib/env';

env.supabaseUrl       // string, default: 'http://127.0.0.1:54321'
env.supabaseAnonKey   // string, default: ''
env.apiTimeout        // number, default: 30000
env.enableOfflineMode // boolean, default: true
env.isDev             // boolean, from __DEV__
```

### Environment Matrix

| Variable | Dev | Acc | Prod |
|----------|-----|-----|------|
| `EXPO_PUBLIC_SUPABASE_URL` | Local Docker IP | Staging Supabase | Production Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Local key | Staging key | Production key |
| `EXPO_PUBLIC_ENABLE_OFFLINE_MODE` | true | true | true |

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
