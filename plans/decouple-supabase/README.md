# Plan: Decouple Mobile App from Direct Supabase Usage

## Current State

The monorepo already has a `packages/repositories` package that implements the repository pattern for data access. However, adoption is inconsistent:

| Package | Uses Repositories? | Direct Supabase Access |
|---------|-------------------|------------------------|
| CLI | ✅ Mostly | Some direct queries for task lookup |
| Web | ❌ No | Auth only (PKCE flow) |
| Mobile | ❌ No | All queries and mutations |

### Key Problems

1. **Mobile bypasses repositories entirely** - All data access is direct Supabase calls
2. **N+1 query patterns** - Both CLI and mobile fetch related entities with sequential queries instead of JOINs
3. **Duplicate auth implementations** - `repositories/auth.ts` exists but mobile has its own in `AuthContext.tsx`
4. **Inconsistent error handling** - `formatSupabaseError` exists but isn't used everywhere
5. **Platform-specific client initialization** - Mobile needs `expo-secure-store`, web needs browser storage

## Recommendation: YES, Consolidate

The infrastructure exists. The work is about **completing adoption**, not building from scratch.

---

## Implementation Plan

### Phase 1: Make Repositories React Native Compatible

**Goal:** Allow mobile to import `@time-tracker/repositories`

#### 1.1 Abstract Storage Adapter

Currently, `packages/repositories` assumes Node.js environment. Mobile needs custom storage.

```typescript
// packages/repositories/src/supabase/storage.ts
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

// Default implementation for Node.js/web
export const defaultStorage: StorageAdapter = {
  getItem: async (key) => localStorage?.getItem(key) ?? null,
  setItem: async (key, value) => localStorage?.setItem(key, value),
  removeItem: async (key) => localStorage?.removeItem(key),
}
```

#### 1.2 Update Connection Factory

```typescript
// packages/repositories/src/supabase/connection.ts
export function initSupabaseClient(
  url: string,
  anonKey: string,
  options?: { storage?: StorageAdapter }
): SupabaseClient
```

#### 1.3 Export Storage Interface

```typescript
// packages/repositories/src/index.ts
export type { StorageAdapter } from './supabase/storage'
export { initSupabaseClient } from './supabase/connection'
```

**Files to modify:**
- `packages/repositories/src/supabase/storage.ts` (new)
- `packages/repositories/src/supabase/connection.ts`
- `packages/repositories/src/index.ts`

---

### Phase 2: Add Missing Repository Methods

**Goal:** Cover all queries currently done directly in mobile

#### 2.1 TimeEntryRepository Enhancements

Add method for fetching entries with related data (currently only mobile does this):

```typescript
interface TimeEntryWithRelations extends TimeEntry {
  client?: { name: string }
  project?: { name: string }
  task?: { name: string }
}

interface TimeEntryRepository {
  // Existing
  findRunning(): Promise<TimeEntry | null>
  stop(id: string): Promise<TimeEntry>

  // New
  findRecentWithRelations(limit: number): Promise<TimeEntryWithRelations[]>
  findRunningWithRelations(): Promise<TimeEntryWithRelations | null>
}
```

#### 2.2 AuthRepository Enhancements

Add missing methods used by mobile:

```typescript
interface AuthRepository {
  // Existing
  signIn(email: string, password: string): Promise<User>
  signUp(email: string, password: string): Promise<User>
  signOut(): Promise<void>

  // New
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: AuthChangeCallback): Unsubscribe
  deleteAccount(password: string): Promise<void>
}
```

**Files to modify:**
- `packages/repositories/src/types.ts`
- `packages/repositories/src/supabase/timeEntry.ts`
- `packages/repositories/src/supabase/auth.ts`

---

### Phase 3: Migrate Mobile to Repositories

**Goal:** Replace all direct Supabase calls with repository calls

#### 3.1 Initialize Repositories with Expo Storage

```typescript
// packages/mobile/src/lib/repositories.ts
import { initSupabaseClient, StorageAdapter } from '@time-tracker/repositories'
import * as SecureStore from 'expo-secure-store'

const expoStorage: StorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}

initSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, { storage: expoStorage })

export {
  createTimeEntryRepository,
  createClientRepository,
  createProjectRepository,
  createTaskRepository,
  createAuthRepository,
} from '@time-tracker/repositories'
```

#### 3.2 Update Hooks

| Hook | Current | After |
|------|---------|-------|
| `useTimer` | Direct queries + N+1 | `timeEntryRepo.findRunningWithRelations()` |
| `useTimeEntries` | Direct query with JOIN | `timeEntryRepo.findRecentWithRelations(100)` |
| `useClient` | Direct query | `clientRepo.findAll()` |

#### 3.3 Update AuthContext

Replace direct `supabase.auth.*` calls with `authRepo.*` calls.

**Files to modify:**
- `packages/mobile/src/lib/repositories.ts` (new)
- `packages/mobile/src/lib/supabase.ts` (delete or simplify)
- `packages/mobile/src/hooks/useTimer.ts`
- `packages/mobile/src/hooks/useTimeEntries.ts`
- `packages/mobile/src/contexts/AuthContext.tsx`
- `packages/mobile/src/components/ClientPickerModal.tsx`
- `packages/mobile/src/components/ProjectPickerModal.tsx`
- `packages/mobile/src/components/TaskPickerModal.tsx`
- `packages/mobile/package.json` (add `@time-tracker/repositories` dependency)

---

### Phase 4: Clean Up CLI Direct Access

**Goal:** Remove remaining direct Supabase queries from CLI

The CLI has one location with direct queries (task lookup in `src/index.ts:240-272`).

```typescript
// Before (direct)
const { data: existingTask } = await getSupabaseClient()
  .from('tasks')
  .select('*')
  .eq('name', options.task)
  .eq('project_id', projectId)
  .maybeSingle()

// After (repository)
const taskRepo = createTaskRepository()
const existingTask = await taskRepo.findByNameAndProject(options.task, projectId)
```

**Files to modify:**
- `packages/repositories/src/supabase/task.ts` (add `findByNameAndProject`)
- `packages/cli/src/index.ts`

---

### Phase 5: Web Integration (Optional)

The web package only uses Supabase for the password reset PKCE flow. This is a special case that may not benefit from repository abstraction since it's purely auth-related and uses browser redirects.

**Recommendation:** Leave as-is unless web expands to include data queries.

---

## Proposed Architecture

```
┌─────────────────┐
│  packages/core  │  (Types only - unchanged)
└────────┬────────┘
         │
┌────────▼────────────────────────────┐
│       packages/repositories          │
├──────────────────────────────────────┤
│ StorageAdapter interface             │
│ initSupabaseClient(url, key, opts)   │
│ Repository interfaces & impls        │
│ - ClientRepository                   │
│ - ProjectRepository                  │
│ - TaskRepository                     │
│ - TimeEntryRepository (enhanced)     │
│ - AuthRepository (enhanced)          │
│ Error handling (formatSupabaseError) │
└──────────────────────────────────────┘
         ▲
         │
    ┌────┴────┬──────────┐
    │         │          │
┌───▼───┐ ┌───▼───┐ ┌────▼────┐
│  CLI  │ │Mobile │ │   Web   │
├───────┤ ├───────┤ ├─────────┤
│100%   │ │100%   │ │Auth only│
│repos  │ │repos  │ │(direct) │
└───────┘ └───────┘ └─────────┘
```

---

## Benefits

1. **Single source of truth** - All data access logic in one place
2. **Testability** - Mock repositories easily for unit tests
3. **Consistency** - Same query patterns, error handling everywhere
4. **Performance** - Fix N+1 queries once, benefit everywhere
5. **Type safety** - Repository interfaces catch errors at compile time
6. **Future-proofing** - Swap Supabase for another backend without touching apps

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Mobile bundle size increase | Repositories package is small (~50KB) |
| Breaking existing functionality | Migrate incrementally, one hook at a time |
| Platform-specific edge cases | Storage adapter abstraction handles this |

---

## Effort Estimate

| Phase | Scope |
|-------|-------|
| Phase 1 | 3 files, ~100 lines |
| Phase 2 | 3 files, ~150 lines |
| Phase 3 | 10 files, ~300 lines refactored |
| Phase 4 | 2 files, ~50 lines |
| Phase 5 | Optional |

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (make repositories RN-compatible)
3. Add tests for new repository methods
4. Migrate mobile incrementally
