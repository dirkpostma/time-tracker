# Mobile App Implementation Plan

## Overview

Transform the existing CLI time-tracker into a monorepo supporting both CLI and Expo mobile app.

**Key Decisions:**
- Framework: Expo (managed workflow)
- Platforms: iOS & Android
- MVP: Timer only (start/stop, select client/project/task, status)
- Code sharing: Monorepo with npm workspaces
- Offline: Online only
- Auth: Supabase Auth (email/password) - same account for CLI and mobile

---

## Documentation Strategy

**Hybrid approach:**
- `specs/` - Stable documentation (Screaming Architecture by domain)
- `beads` - Work items (tasks, bugs, features with descriptions)

### Specs Reorganization (Screaming Architecture)

Reorganize existing specs and add mobile specs:

```
specs/
├── core/
│   └── data-model.md              # (move from data-model.md)
├── time-tracking/
│   ├── flow.md                    # (move from time-tracking-flow.md)
│   ├── timer-switch.md            # (move from timer-switch-confirmation.md)
│   └── recent.md                  # (move from recent.md)
├── cli/
│   ├── commands.md                # (move from cli-commands.md)
│   ├── config.md                  # (move from config.md)
│   └── interactive-mode.md        # (move from interactive-mode.md)
└── mobile/                        # NEW - detailed specs
    ├── architecture.md            # Monorepo, code sharing, packages
    ├── auth.md                    # Supabase Auth flow (CLI + mobile)
    ├── screens/
    │   ├── status.md              # Timer status screen spec
    │   └── start-timer.md         # Start timer flow spec
    └── testing.md                 # Maestro E2E test specs
```

### Mobile Spec Details

**`specs/mobile/architecture.md`** should include:
- Monorepo folder structure
- Package dependencies diagram
- Code sharing approach (core, repositories)
- Dependency injection pattern for Supabase client

**`specs/mobile/auth.md`** should include:
- Supabase Auth configuration
- CLI login flow (email/password → token storage)
- Mobile login flow (SecureStore)
- Token refresh strategy
- Database RLS policies

**`specs/mobile/screens/status.md`** should include:
- Wireframe (ASCII)
- States: no timer, timer running
- Data displayed: client, project, task, duration
- Actions: start, stop

**`specs/mobile/screens/start-timer.md`** should include:
- Step-by-step flow wireframes
- Entity picker behavior
- "Add new" inline creation
- Skip options for project/task

**`specs/mobile/testing.md`** should include:
- Maestro test scenarios
- Test data setup
- CI integration approach

---

## Issue Tracking (beads)

Create these issues to track implementation:

```bash
# Epic (parent)
bd create --title="Mobile app MVP" --type=feature --priority=1

# Documentation (do first - before implementation)
bd create --title="Reorganize specs/ into Screaming Architecture folders" --type=task --priority=1
bd create --title="Write specs/mobile/architecture.md" --type=task --priority=1
bd create --title="Write specs/mobile/auth.md" --type=task --priority=1
bd create --title="Write specs/mobile/screens/*.md" --type=task --priority=2
bd create --title="Write specs/mobile/testing.md" --type=task --priority=2

# Phase 1: Monorepo (depends on nothing)
bd create --title="Set up monorepo with npm workspaces" --type=task --priority=2
bd create --title="Extract @time-tracker/core package" --type=task --priority=2
bd create --title="Extract @time-tracker/repositories package" --type=task --priority=2
bd create --title="Migrate CLI to packages/cli" --type=task --priority=2

# Phase 2: Database & Auth foundation (depends on Phase 1)
bd create --title="Add user_id and RLS to database" --type=task --priority=2
bd create --title="Add tt login/logout commands to CLI" --type=task --priority=2

# Phase 3: Expo setup (depends on Phase 2)
bd create --title="Initialize Expo app in packages/mobile" --type=task --priority=2
bd create --title="Configure Metro for workspaces" --type=task --priority=2

# Phase 4: Mobile Auth (depends on Phase 3)
bd create --title="Implement Supabase Auth in mobile app" --type=task --priority=2

# Phase 5: Timer features (depends on Phase 4)
bd create --title="Build timer status screen" --type=task --priority=2
bd create --title="Build start timer flow" --type=task --priority=2

# Phase 6: Testing & Polish (depends on Phase 5)
bd create --title="Add unit and component tests for mobile" --type=task --priority=3
bd create --title="Add Maestro E2E tests" --type=task --priority=2
bd create --title="Polish UI and error handling" --type=task --priority=3
```

After creating, add dependencies:
```bash
bd dep add <core-pkg> <monorepo-setup>
bd dep add <repos-pkg> <core-pkg>
bd dep add <cli-migrate> <repos-pkg>
bd dep add <expo-init> <cli-migrate>
# etc.
```

---

## Phase 1: Monorepo Setup

### 1.1 Create workspace structure

```
time-tracker/
├── packages/
│   ├── core/           # Pure business logic (shared)
│   ├── repositories/   # Data access layer (shared)
│   ├── cli/            # CLI application
│   └── mobile/         # Expo mobile app
├── package.json        # Root workspace config
└── tsconfig.base.json  # Shared TS config
```

### 1.2 Extract @time-tracker/core

Move from `/src/core/`:
- `types.ts` - Domain types (Client, Project, Task, TimeEntry)
- `timer.ts` - Timer logic (startTimer, stopTimer, getTimerState)
- `validation.ts` - Input validation

### 1.3 Extract @time-tracker/repositories

Move from `/src/repositories/`:
- `types.ts` - Repository interfaces
- `supabase/` - Supabase implementation

**Critical change:** Modify `connection.ts` to use dependency injection instead of file-based config:

```typescript
// Before: reads from ~/.tt/config.json (Node.js specific)
// After: client injected via setSupabaseClient()
export function setSupabaseClient(client: SupabaseClient): void;
export function getSupabaseClient(): SupabaseClient;
```

### 1.4 Migrate CLI to workspace

- Move `/src/cli/` to `packages/cli/src/`
- Update imports to use `@time-tracker/core` and `@time-tracker/repositories`
- Add bootstrap code to initialize Supabase client from file config

---

## Phase 2: Database & Auth Foundation

### 2.1 Database migration

Add `user_id` column and Row Level Security (RLS):

```sql
-- Add user_id to all tables
ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE time_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (users only see their own data)
CREATE POLICY "Users manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own time_entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
```

### 2.2 CLI Authentication

Add new commands to CLI:

- `tt login` - Email/password prompt, stores tokens in `~/.tt/config.json`
- `tt logout` - Clears stored tokens
- `tt whoami` - Shows current user email

**Token storage in config:**
```json
{
  "supabaseUrl": "https://...",
  "supabaseKey": "...",
  "auth": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": 1234567890
  }
}
```

> **Security note:** Tokens stored in file with 0600 permissions. This is intentional for simplicity in a personal tool. Future enhancement: migrate to system keychain (macOS Keychain, etc.) for better security.

**Auto-refresh:** Before any API call, check if token expired and refresh if needed.

### 2.3 Update repositories

Modify repository methods to include `user_id` when creating records:
- Get current user from Supabase client session
- Include `user_id` in all `create()` calls

---

## Phase 3: Expo App Setup

### 3.1 Initialize Expo

```bash
cd packages
npx create-expo-app mobile --template expo-template-blank-typescript
```

### 3.2 Install dependencies

- `expo-router` - File-based routing
- `expo-secure-store` - Secure auth token storage
- `@supabase/supabase-js` - Database client

### 3.3 Configure Metro for workspaces

Add `metro.config.js` to watch workspace folders.

### 3.4 App structure

```
packages/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   └── index.tsx      # Status/Timer screen
│   ├── start-timer.tsx    # Start timer flow (modal)
│   └── _layout.tsx        # Root layout with auth check
└── src/
    ├── components/
    ├── hooks/
    ├── providers/
    └── lib/supabase.ts
```

---

## Phase 4: Mobile Auth

### 4.1 Create AuthProvider

- Manage session state with `onAuthStateChange`
- Expose `signIn`, `signUp`, `signOut` methods
- Store tokens in SecureStore

### 4.2 Build auth screens

- Login: email/password form
- Signup: email/password form
- Route protection in root layout

---

## Phase 5: Timer Features (MVP)

### 5.1 Status Screen (Home tab)

- Display current timer state (running/stopped)
- If running: show client/project/task, live duration, stop button
- If stopped: show "Start Timer" button

### 5.2 Start Timer Flow

Modal with step-by-step selection:
1. Select client (required) - with "Add new" option
2. Select project (optional)
3. Select task (optional, if project selected)
4. Add description (optional)
5. Confirm & start

### 5.3 Custom hooks

- `useTimer()` - wraps core timer functions
- `useClients()`, `useProjects()`, `useTasks()` - data fetching

---

## Phase 6: Testing & Polish

### 6.1 Unit & Component tests

- Unit tests: Jest for hooks and utilities
- Component tests: React Native Testing Library

### 6.2 E2E tests with Maestro

Install Maestro CLI:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Test structure:
```
packages/mobile/
├── .maestro/
│   ├── auth-flow.yaml       # Login/signup flow
│   ├── timer-start.yaml     # Start timer flow
│   └── timer-stop.yaml      # Stop running timer
```

Example test (`auth-flow.yaml`):
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
- assertVisible: "Start Timer"  # Home screen after login
```

Example test (`timer-start.yaml`):
```yaml
appId: com.timetracker.mobile
---
- launchApp
# Assumes already logged in
- tapOn: "Start Timer"
- assertVisible: "Select Client"
- tapOn: "Acme Corp"
- tapOn: "Skip"  # Skip project
- tapOn: "Start"
- assertVisible: "Stop Timer"
```

Run tests:
```bash
cd packages/mobile
maestro test .maestro/
```

### 6.3 Polish

- Loading states and error handling
- Consistent styling
- Update README with mobile setup

---

## Critical Files to Modify

**Specs (reorganize):**
| From | To |
|------|-----|
| `specs/data-model.md` | `specs/core/data-model.md` |
| `specs/time-tracking-flow.md` | `specs/time-tracking/flow.md` |
| `specs/timer-switch-confirmation.md` | `specs/time-tracking/timer-switch.md` |
| `specs/recent.md` | `specs/time-tracking/recent.md` |
| `specs/cli-commands.md` | `specs/cli/commands.md` |
| `specs/config.md` | `specs/cli/config.md` |
| `specs/interactive-mode.md` | `specs/cli/interactive-mode.md` |

**New specs (create):**
| File | Content |
|------|---------|
| `specs/mobile/architecture.md` | Monorepo, code sharing, packages |
| `specs/mobile/auth.md` | CLI + mobile auth flow, RLS |
| `specs/mobile/screens/status.md` | Status screen wireframe & behavior |
| `specs/mobile/screens/start-timer.md` | Start timer flow wireframes |
| `specs/mobile/testing.md` | Maestro E2E test specs |

**Code changes:**
| File | Change |
|------|--------|
| `/src/core/*` | Move to `packages/core/src/` |
| `/src/repositories/*` | Move to `packages/repositories/src/` |
| `/src/repositories/supabase/connection.ts` | Add dependency injection |
| `/src/cli/*` | Move to `packages/cli/src/`, update imports |
| `/package.json` | Convert to workspace root |
| `supabase/migrations/` | New migration for user_id and RLS |
| `packages/cli/src/auth.ts` | New file for login/logout commands |

---

## Verification

0. **After Docs**: All specs written and reviewed before implementation starts
1. **After Phase 1**: Run `npm test` from root - all existing tests pass
2. **After Phase 1**: Run CLI with `npm run cli -- status` - works as before
3. **After Phase 2**: Run migration, test `tt login` / `tt logout` / `tt whoami`
4. **After Phase 3**: Run `npm run mobile` - Expo dev server starts
5. **After Phase 4**: Login/signup flow works in mobile, tokens persist
6. **After Phase 5**: Can start/stop timer from mobile app, data syncs with CLI
7. **After Phase 6**: `maestro test .maestro/` passes all E2E tests
