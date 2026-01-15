# Time Tracker Refactoring Plan

## Goal

Prepare the codebase for:
- **Mobile app** (React Native/Expo) with direct Supabase access
- **Reporting features** (time summaries, exports, dashboards)
- **Future extensibility**

## Current Architecture

```
src/
├── index.ts              # CLI entry (Commander.js)
├── config.ts             # Credentials (~/.tt/config.json)
├── recent.ts             # Last used selections
├── commands/             # Mixed: business logic + CLI + data access
│   ├── client.ts
│   ├── project.ts
│   ├── task.ts
│   ├── timeEntry.ts
│   ├── interactive.ts
│   ├── config.ts
│   └── timerSwitch.ts
└── db/
    └── client.ts         # Supabase singleton
```

**Problem**: Business logic is embedded in CLI commands. Cannot share with mobile app.

## Target Architecture

```
src/
├── core/                    # Pure business logic (shareable)
│   ├── types.ts            # Client, Project, Task, TimeEntry types
│   ├── validation.ts       # Input validation functions
│   ├── timer.ts            # Timer state and operations
│   └── reporting/
│       ├── summaries.ts    # Time aggregations
│       ├── exports.ts      # CSV/PDF generation
│       └── analytics.ts    # Dashboard calculations
├── repositories/           # Data access (shareable)
│   ├── types.ts            # Repository interfaces
│   └── supabase/
│       ├── client.ts
│       ├── project.ts
│       ├── task.ts
│       ├── timeEntry.ts
│       └── index.ts
├── cli/                    # CLI-specific (not shared)
│   ├── commands/
│   ├── prompts/
│   └── formatters/
├── config.ts               # Keep as-is
├── recent.ts               # Keep as-is
└── index.ts                # CLI entry
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
- Query methods for reporting

### CLI Layer
- User interaction (Commander, Inquirer)
- Output formatting for terminal
- Error presentation
- Calls core + repository

## Phases

### Phase 1: Foundation
- [ ] Create `src/core/types.ts` with shared types
- [ ] Create `src/repositories/types.ts` with interfaces
- [ ] Write tests for new modules

### Phase 2: Repository Extraction
- [ ] Extract client data access to repository
- [ ] Extract project data access
- [ ] Extract task data access
- [ ] Extract timeEntry data access
- [ ] Update commands to use repositories

### Phase 3: Core Logic Extraction
- [ ] Extract validation functions to core
- [ ] Extract timer logic (start/stop/state)
- [ ] Extract timer switch logic
- [ ] Update CLI commands as thin wrappers

### Phase 4: Reporting
- [ ] Add reporting repository methods
- [ ] Create summary functions in core
- [ ] Add export formatters
- [ ] Create CLI commands for reports

### Phase 5: Restructure CLI
- [ ] Move commands to `src/cli/commands/`
- [ ] Extract prompts to `src/cli/prompts/`
- [ ] Create output formatters
- [ ] Update imports in index.ts

## Example Extractions

### Timer Logic

**Before** (`src/commands/timeEntry.ts`):
```typescript
export async function startTimer(clientId, projectId, taskId, description, force) {
  const client = getSupabaseClient();
  const running = await getRunningTimer();
  if (running && !force) {
    throw new Error('Timer already running');
  }
  // ... insert logic with console.log
}
```

**After**:
```typescript
// src/core/timer.ts
export interface StartTimerResult {
  success: boolean;
  entry?: TimeEntry;
  stoppedEntry?: TimeEntry;
  error?: string;
}

export async function startTimer(
  repo: TimeEntryRepository,
  request: StartTimerRequest,
  options: { force?: boolean }
): Promise<StartTimerResult> {
  // Pure logic - returns result, no side effects
}

// src/cli/commands/timeEntry.ts
export async function startTimerCommand(...) {
  const result = await startTimer(repo, request, options);
  if (result.success) {
    console.log(`Timer started for ${result.entry.description}`);
  } else {
    console.error(result.error);
  }
}
```

### Reporting

```typescript
// src/core/reporting/summaries.ts
export interface TimeSummary {
  totalMinutes: number;
  byClient: { id: string; name: string; minutes: number }[];
  byProject: { id: string; name: string; minutes: number }[];
  byDay: { date: string; minutes: number }[];
}

export async function getDailySummary(
  repo: TimeEntryRepository,
  date: Date
): Promise<TimeSummary>

export async function getWeeklySummary(
  repo: TimeEntryRepository,
  weekStart: Date
): Promise<TimeSummary>

export async function getMonthlySummary(
  repo: TimeEntryRepository,
  year: number,
  month: number
): Promise<TimeSummary>
```

## Mobile App Sharing

Once refactored, mobile app can:
```typescript
// In React Native app
import { startTimer, getTimeSummary } from '@time-tracker/core';
import { createSupabaseRepository } from '@time-tracker/repositories';

const repo = createSupabaseRepository(supabaseClient);
const result = await startTimer(repo, { clientId, description });
```

Options for sharing:
1. **Monorepo**: Keep CLI and mobile in same repo
2. **NPM packages**: Publish core/repositories as packages
3. **Copy**: Manually sync shared code (not recommended)

## Success Criteria

- [ ] All existing tests pass
- [ ] Core layer has no CLI dependencies
- [ ] Repository layer is interface-based
- [ ] CLI commands are thin wrappers
- [ ] Can import core/repositories in a fresh TypeScript project
- [ ] Reporting features work via CLI
