# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CLI application for tracking time spent on projects.

## Data Model

Hierarchy: **Client > Project > Task (optional) > TimeEntry**

- **Client**: Top-level entity (company/individual you work for)
- **Project**: Belongs to a client
- **Task**: Optional, belongs to a project
- **TimeEntry**: Start/end timestamps for work sessions

Storage: Supabase (PostgreSQL)

## Commands

```bash
npm run build      # Build the CLI
npm run dev        # Build in watch mode
npm test           # Run tests in watch mode
npm test -- --run  # Run tests once
```

## Local Development with Docker Supabase

**IMPORTANT: Always test against local Docker Supabase, not cloud.**

### Prerequisites
1. Start local Supabase: `npx supabase start`
2. Verify it's running: `npx supabase status`

### Configuration
The `.env` file is configured for local Docker Supabase:
```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_PUBLISHABLE_KEY=<from supabase status>
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test1234
```

### Test User Setup
Create a test user in local Supabase (if not exists):
```bash
npx supabase db execute --sql "
  SELECT create_user('test@example.com', 'Test1234');
"
```
Or via Supabase Studio at http://127.0.0.1:54323 > Authentication > Users

### Running Tests
```bash
npm test -- --run              # All tests against local Docker
npm test -- --run auth         # Auth tests only
```

## Specifications

**IMPORTANT: Follow the spec-first workflow.**

```
Idea → Spec → Test → Implementation
```

### Hybrid Structure

Specs live in two places:

| Type | Location | Purpose |
|------|----------|---------|
| Architecture | `specs/architecture/` | System design, data model, layers |
| Features | `specs/features/` | End-to-end flows (cross-cutting) |
| Package specs | `packages/*/spec.md` | Requirements, colocated with code |

### Finding the Right Spec

| Looking for... | Go to |
|----------------|-------|
| System overview | `specs/README.md` |
| Data model | `specs/architecture/data-model.md` |
| Layer architecture | `specs/architecture/layers.md` |
| Feature flow | `specs/features/*.md` |
| Core requirements | `packages/core/spec.md` |
| Repository interfaces | `packages/repositories/spec.md` |
| CLI commands | `packages/cli/spec.md` |

### Updating Specs

**Before writing code, update the relevant spec:**

| Change Type | Update Location |
|-------------|-----------------|
| New entity/field | `specs/architecture/data-model.md` + `packages/core/spec.md` |
| New business rule | `packages/core/spec.md` |
| New repository method | `packages/repositories/spec.md` |
| New CLI command | `packages/cli/spec.md` |
| New feature flow | `specs/features/*.md` |
| Architecture change | `specs/architecture/*.md` |

### Requirement IDs

Use lowercase requirement IDs for traceability:

```
req-{package}-{number}

req-core-001    # Core package requirement
req-repo-001    # Repository requirement
req-cli-001     # CLI requirement
req-feat-001    # Feature requirement
req-arch-001    # Architecture requirement
```

## Issue Tracking with Beads

Use **bd (beads)** for tracking work items:

| Use Case | Tool |
|----------|------|
| "What the system IS" | Specs (spec.md files) |
| "What to DO" | Beads (bd issues) |

**Quick reference:**
- `bd ready` - Find unblocked work
- `bd create "Title" --type task --priority 2` - Create issue
- `bd close <id>` - Complete work
- `bd sync` - Sync with git (run at session end)

For full workflow context, run: `bd prime`

## Plan Files

**IMPORTANT: Always write plans to `history/`, NOT `~/.claude/plans/`.**

Plans are stored in `history/` and committed to git. This keeps planning artifacts with the codebase.

**Structure:**
- Small features: `history/YYMMDD-feature-name.md` (single file)
- Large features: `history/YYMMDD-feature-name/` (folder with multiple files)

**Keep plans small and focused:**
- Each file should be <100 lines
- Split by concern: architecture, auth, screens, testing, etc.
- Use README.md as index linking to other files

**Example structure:**
```
history/260115-mobile-app/
├── README.md           # Overview, decisions, verification checklist
├── docs-strategy.md    # Documentation approach
├── monorepo.md         # Phase 1: Monorepo setup
├── auth.md             # Phase 2: Auth & database
├── mobile.md           # Phases 3-5: Mobile app
├── testing.md          # Phase 6: Testing
└── beads-issues.md     # Issue creation commands
```

## Feature Development Workflow

**IMPORTANT: Follow the spec-first workflow: Idea → Spec → Test → Implementation**

### 1. Understand (Ask Questions)

Before anything else, clarify requirements:
- What is the expected input/output?
- What are the edge cases?
- How should errors be handled?
- Does this need CLI commands, or just core logic?
- How does this interact with existing features?

### 2. Spec (Write Requirements)

**Before writing code:**
1. Create beads issue: `bd create "Feature" --type feature --description "..."`
2. Update the relevant spec file (see "Updating Specs" table above)
3. Add requirement IDs (req-xxx-nnn) for each requirement
4. Get user approval on the spec

### 3. Test (TDD)

Write tests BEFORE implementation:
```typescript
describe('req-core-001: One timer at a time', () => {
  it('should error when starting timer while one runs', () => {
    // ...
  });
});
```

### 4. Implement

Only after spec exists and test fails:
1. Write minimal code to pass test
2. Refactor if needed
3. Verify spec requirements are met

### 5. Verify

Before marking complete:
- [ ] All tests pass
- [ ] Spec requirements have corresponding tests
- [ ] Implementation matches spec
- [ ] spec.md updated if API changed
- [ ] Close beads issue: `bd close <id>`

### Session Completion

When ending a work session, complete ALL steps:

1. **File issues** for remaining work
2. **Run quality gates** (if code changed) - tests, linters, builds
3. **Update issue status** - Close finished work
4. **Push to remote**:
   ```bash
   git pull --rebase
   bd sync
   git push
   ```
5. **Verify** - `git status` shows "up to date with origin"
