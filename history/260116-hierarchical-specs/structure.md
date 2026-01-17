# Hybrid Specs Structure

## Core Principle

**Two locations, clear rules:**

| What | Where | Changes When |
|------|-------|--------------|
| Architecture & cross-cutting | `/specs/` | Rarely (design decisions) |
| Package specifications | `packages/*/spec.md` | With code changes |

---

## Complete Structure

```
time-tracker/
├── specs/                          # System-level documentation
│   ├── README.md                   # System overview & navigation
│   ├── architecture/
│   │   ├── overview.md             # Goals, principles, constraints
│   │   ├── layers.md               # Core → Repositories → CLI
│   │   └── data-model.md           # Entity relationships
│   └── features/
│       ├── time-tracking.md        # Timer start/stop/switch flows
│       └── authentication.md       # Login/logout/session flows
│
├── packages/
│   ├── core/
│   │   ├── README.md               # Setup, usage, examples
│   │   ├── spec.md                 # Requirements (req-core-*)
│   │   └── src/
│   │       ├── timer.ts
│   │       ├── timer.test.ts
│   │       ├── types.ts
│   │       ├── types.test.ts
│   │       ├── validation.ts
│   │       └── validation.test.ts
│   │
│   ├── repositories/
│   │   ├── README.md               # Setup, usage
│   │   ├── spec.md                 # Repository interfaces (req-repo-*)
│   │   └── src/
│   │       ├── types.ts
│   │       └── supabase/
│   │           ├── spec.md         # Supabase-specific requirements
│   │           ├── client.ts
│   │           ├── client.test.ts
│   │           └── ...
│   │
│   └── cli/
│       ├── README.md               # Setup, usage
│       ├── spec.md                 # CLI commands (req-cli-*)
│       └── src/
│           ├── index.ts
│           ├── auth.ts
│           ├── auth.test.ts
│           └── ...
│
└── claude.md                       # Development workflow
```

---

## File Purposes

| File | Purpose |
|------|---------|
| `README.md` | Setup instructions, usage examples, getting started |
| `spec.md` | Formal requirements (req-*), business rules, contracts |

---

## `/specs/` Contents

### specs/README.md

```markdown
# Time Tracker

CLI tool for tracking time on client/project/task hierarchy.

## Quick Start

- [Architecture](./architecture/) — System design
- [Features](./features/) — End-to-end flows

## Package Specifications

- [Core spec](../packages/core/spec.md) — Business logic, types, validation
- [Repositories spec](../packages/repositories/spec.md) — Data access layer
- [CLI spec](../packages/cli/spec.md) — Command-line interface

## Data Model

Client → Project → Task → TimeEntry

## Key Constraints

- One timer running at a time
- All times stored in UTC
- Supabase backend
```

### specs/architecture/

| File | Content |
|------|---------|
| `overview.md` | System goals, principles, tech stack |
| `layers.md` | Layer responsibilities and dependencies |
| `data-model.md` | Entity definitions and relationships |

### specs/features/

| File | Content |
|------|---------|
| `time-tracking.md` | Start/stop/switch/status flows |
| `authentication.md` | Login/logout/session management |

---

## Package spec.md Templates

### packages/core/spec.md

```markdown
# Core Package Specification

Pure business logic and types. No I/O, no side effects.

## Modules

| Module | Purpose | Tests |
|--------|---------|-------|
| `types.ts` | Entity types (Client, Project, Task, TimeEntry) | `types.test.ts` |
| `timer.ts` | Timer logic (start, stop, duration) | `timer.test.ts` |
| `validation.ts` | Input validation rules | `validation.test.ts` |
| `repository-types.ts` | Repository interfaces | — |

## Timer Rules

### req-core-001: One timer at a time
Only one timer can run. Starting new timer while one runs requires `force: true`.

**Tests:** `src/timer.test.ts`
- "should return error when timer is already running"
- "should stop existing timer when force is true"

### req-core-002: Duration calculation
Duration = floor((endedAt - startedAt) / 60000) minutes.
If no endedAt, use current time.

**Tests:** `src/timer.test.ts`
- "should calculate duration in minutes"
- "should handle fractional minutes by flooring"

## Validation Rules

### req-core-010: Client name
- Required, non-empty string
- Max 100 characters

**Tests:** `src/validation.test.ts`

### req-core-011: Project name
- Required, non-empty string
- Max 100 characters

## Dependencies

- None (pure package)

## Used By

- `@time-tracker/repositories`
- `@time-tracker/cli`
```

### packages/repositories/spec.md

```markdown
# Repositories Package Specification

Data access layer with Supabase implementation.

## Interfaces

| Interface | Methods |
|-----------|---------|
| `ClientRepository` | create, findById, findByName, findAll |
| `ProjectRepository` | create, findById, findByName, findByClient |
| `TaskRepository` | create, findById, findByName, findByProject |
| `TimeEntryRepository` | create, update, findById, findRunning, stop |

## Requirements

### req-repo-001: Config file location
Configuration stored at `~/.tt/config.json`.

### req-repo-002: Config file permissions
Config file must have 0600 permissions (owner read/write only).

### req-repo-003: Token refresh
Automatically refresh expired tokens using refresh_token.

## Supabase Implementation

See [supabase/spec.md](./src/supabase/spec.md) for implementation details.

## Configuration Format

```json
{
  "supabaseUrl": "...",
  "supabaseKey": "...",
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Dependencies

- `@time-tracker/core` — Types and interfaces
- `@supabase/supabase-js` — Database client
```

### packages/cli/spec.md

```markdown
# CLI Package Specification

Command-line interface using Commander.js.

## Commands

### Time Tracking
```
tt start --client <name> [--project <name>] [--task <name>]
tt stop [--description <desc>]
tt status
```

### Entity Management
```
tt client add <name>
tt client list
tt project add <name> --client <client>
tt project list
tt task list --client <client> --project <project>
```

### Authentication
```
tt login
tt logout
tt whoami
```

### Interactive Mode
```
tt              # No args launches interactive selection
```

## Requirements

### req-cli-001: Name matching
`--client`, `--project`, `--task` match by exact name.
If not found, prompt: "X doesn't exist. Create it? [y/n]"

### req-cli-002: Auth required
All commands except `config`, `login`, `logout`, `whoami` require authentication.

### req-cli-003: Interactive defaults
Recent selections stored in `~/.tt-recent.json` for quick access.

## Dependencies

- `@time-tracker/core`
- `@time-tracker/repositories`
- `commander` — CLI framework
- `inquirer` — Interactive prompts
```

---

## Navigation Flow

```
Developer looking for info:
│
├─→ "How does the system work?"
│   └─→ specs/README.md → specs/architecture/
│
├─→ "How does timer switching work?"
│   └─→ specs/features/time-tracking.md
│
├─→ "What are the core requirements?"
│   └─→ packages/core/spec.md
│
├─→ "How do I set up the CLI?"
│   └─→ packages/cli/README.md
│
└─→ "What are the repository interfaces?"
    └─→ packages/repositories/spec.md
```

---

## Benefits of spec.md

1. **Clear purpose** — spec.md is unambiguous, it's the specification
2. **Separation** — README.md for setup/usage, spec.md for requirements
3. **Colocation** — Specs live next to code and tests
4. **Lowercase** — No cross-OS casing issues, zero mental overhead
5. **Discoverable** — Consistent naming across all packages
