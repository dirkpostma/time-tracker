# Mobile App Implementation

## Prerequisites

Before starting, ensure these are done (see README.md):
1. `setSupabaseClient()` injection in repositories package
2. Token storage abstraction for cross-platform use

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
- `@time-tracker/core` - Shared types and business logic (workspace dependency)

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
    │   └── AuthProvider.tsx
    └── lib/
        └── supabase.ts    # Creates client, calls setSupabaseClient()
```

### Code Sharing

Mobile can import from workspace packages:
```typescript
import { Client, Project, TimeEntry } from '@time-tracker/core';
import { getActiveTimer, startTimer } from '@time-tracker/core/timer';
```

## Phase 4: Mobile Auth

### Supabase Setup (src/lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { setSupabaseClient } from '@time-tracker/repositories';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
  },
});

// Inject into repositories so shared code works
setSupabaseClient(supabase);

export { supabase };
```

### AuthProvider

- Manage session with `onAuthStateChange`
- Expose `signIn`, `signUp`, `signOut`
- Tokens auto-stored via SecureStore (configured above)

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

```typescript
// Wrap repository functions with React Query or similar
useTimer()    // Timer state and operations
useClients()  // Fetch clients from repository
useProjects() // Fetch projects from repository
useTasks()    // Fetch tasks from repository
```
