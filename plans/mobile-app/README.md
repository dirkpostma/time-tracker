# Mobile App Implementation Plan

## Overview

Add Expo mobile app to the existing CLI time-tracker monorepo.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Framework | Expo (managed workflow) |
| Platforms | iOS & Android |
| MVP Scope | Timer only (start/stop, status) |
| Code sharing | Monorepo with npm workspaces |
| Offline | Online only |
| Auth | Supabase Auth (same account CLI + mobile) |

## Current Status

### Completed (moved to history/)
- **Monorepo setup** - `packages/core`, `packages/repositories`, `packages/cli` all working
- **CLI auth** - `tt login`, `tt logout`, `tt whoami` implemented
- **Core/CLI specs** - documented in `/specs/core/` and `/specs/cli/`

### Prerequisites Before Mobile

Before starting mobile implementation, these items need attention:

1. **Dependency injection for Supabase client**
   - Current: `connection.ts` creates client from env/config file
   - Needed: `setSupabaseClient()` function so mobile can inject its own client
   - Impact: Required for mobile to share repository code

2. **Abstract token storage**
   - Current: Tokens saved to `~/.tt/config.json` (Node.js file system)
   - Needed: Abstract interface so mobile can use `expo-secure-store`
   - Options: Create TokenStore interface, or pass storage functions to auth

3. **Database RLS (Row Level Security)**
   - Current: No user isolation - all data shared
   - Needed: RLS policies to restrict users to their own data
   - When: Before production mobile release

## Remaining Phases

| Phase | Description | Details |
|-------|-------------|---------|
| 3 | Expo setup | [mobile.md](mobile.md) - Create packages/mobile |
| 4 | Mobile auth | [mobile.md](mobile.md) - AuthProvider, login/signup screens |
| 5 | Timer features | [mobile.md](mobile.md) - Status screen, start timer flow |
| 6 | Testing | [testing.md](testing.md) - Jest + Maestro E2E |

## Verification Checklist

### Already Working
- [x] `npm test` passes from root
- [x] CLI works: `npm run cli -- status`
- [x] `tt login` / `tt logout` / `tt whoami` work

### Mobile (TODO)
- [ ] `setSupabaseClient()` injection available in repositories
- [ ] Token storage abstracted for cross-platform use
- [ ] Mobile specs written (`specs/mobile/`)
- [ ] Expo dev server starts
- [ ] Mobile login/signup works
- [ ] Timer start/stop works on mobile
- [ ] `maestro test .maestro/` passes
