# Phases 3-5: Mobile App

## Phase 3: Expo Setup

### Initialize

```bash
cd packages
npx create-expo-app mobile --template expo-template-blank-typescript
```

### Dependencies

- `expo-router` - File-based routing
- `expo-secure-store` - Secure token storage
- `@supabase/supabase-js` - Database client

### App Structure

```
packages/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   └── index.tsx      # Status screen
│   ├── start-timer.tsx    # Modal
│   └── _layout.tsx        # Root layout
└── src/
    ├── components/
    ├── hooks/
    ├── providers/
    └── lib/supabase.ts
```

## Phase 4: Mobile Auth

### AuthProvider

- Manage session with `onAuthStateChange`
- Expose `signIn`, `signUp`, `signOut`
- Store tokens in SecureStore

### Screens

- Login: email/password form
- Signup: email/password form
- Route protection in root layout

## Phase 5: Timer Features

### Status Screen

- Display timer state (running/stopped)
- If running: client, project, task, duration, stop button
- If stopped: "Start Timer" button

### Start Timer Flow

1. Select client (required) - "Add new" option
2. Select project (optional) - "Skip" option
3. Select task (optional)
4. Add description (optional)
5. Confirm & start

### Hooks

- `useTimer()` - wraps core timer functions
- `useClients()`, `useProjects()`, `useTasks()` - data fetching
