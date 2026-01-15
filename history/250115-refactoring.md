# Time Tracker Refactoring Plan

## Goal

Prepare the codebase for:
- **Mobile app** (React Native/Expo) with direct Supabase access
- **Future extensibility** (reporting, integrations)

## Current Architecture (After Refactoring)

```
src/
├── core/                    # Pure business logic (shareable)
│   ├── types.ts            # Client, Project, Task, TimeEntry types
│   ├── validation.ts       # Input validation functions
│   └── timer.ts            # Timer state and operations
├── repositories/           # Data access (shareable)
│   ├── types.ts            # Repository interfaces
│   └── supabase/           # Supabase implementations
├── cli/                    # CLI-specific (not shared)
│   └── commands/           # Command handlers
├── commands/               # Backward compatibility re-exports
├── config.ts               # Credential management
├── recent.ts               # Last-used selections
└── index.ts                # CLI entry point
```

## Layer Responsibilities

### Core Layer
- Pure functions, no side effects
- No console.log, no prompts, no file I/O
- Returns data and results
- Easy to unit test
- Can be used by CLI, mobile, or API

### Repository Layer
- Data access abstraction
- Interface-based (can swap implementations)
- CRUD operations per entity

### CLI Layer
- User interaction (Commander, Inquirer)
- Output formatting for terminal
- Error presentation
- Calls core + repository

## Completed Phases

### Phase 1: Foundation ✓
- [x] Create `src/core/types.ts` with shared types
- [x] Create `src/repositories/types.ts` with interfaces
- [x] Write tests for new modules

### Phase 2: Repository Extraction ✓
- [x] Extract client data access to repository
- [x] Extract project data access
- [x] Extract task data access
- [x] Extract timeEntry data access
- [x] Update commands to use repositories

### Phase 3: Core Logic Extraction ✓
- [x] Extract validation functions to core
- [x] Extract timer logic (start/stop/state)
- [x] Update CLI commands as thin wrappers

### Phase 4: Restructure CLI ✓
- [x] Move commands to `src/cli/commands/`
- [x] Update imports in index.ts
- [x] Backward compatibility via re-exports

## Future Work

### Reporting (Not Started)
- [ ] Add reporting repository methods (date range queries)
- [ ] Create summary functions in core
- [ ] Add export formatters (CSV, JSON)
- [ ] Create CLI commands for reports

### Mobile App
- [ ] Test core/repositories in React Native
- [ ] Decide on code sharing approach (monorepo vs npm packages)

## Mobile App Sharing

Once ready, mobile app can:
```typescript
// In React Native app
import { startTimer } from '@time-tracker/core';
import { createTimeEntryRepository } from '@time-tracker/repositories';

const repo = createTimeEntryRepository(supabaseClient);
const result = await startTimer(repo, { clientId, description });
```

## Success Criteria

- [x] All existing tests pass (287 tests)
- [x] Core layer has no CLI dependencies
- [x] Repository layer is interface-based
- [x] CLI commands are thin wrappers
- [ ] Can import core/repositories in a fresh TypeScript project (not tested yet)
