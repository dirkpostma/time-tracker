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

## Documentation Strategy

**Hybrid approach - two types of documentation:**

| Type | Location | Purpose | Examples |
|------|----------|---------|----------|
| **Specs** | `/specs/*.md` | Stable architecture & design docs | Data model, API contracts, CLI commands |
| **Beads** | `bd` issues | Work items & task descriptions | Features, bugs, tasks with acceptance criteria |

**When to use specs:**
- Documenting "what the system IS" (architecture, data model, contracts)
- Reference documentation that outlives individual tasks
- Decisions that affect multiple features

**When to use beads:**
- Tracking "what to DO" (tasks, bugs, features)
- Work items with acceptance criteria (`--acceptance`)
- Design notes for specific features (`--design`, `--description`)

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

**IMPORTANT: Always start with a planning phase before implementation.**

### 1. Planning Phase (Required)
- Ask clarifying questions to understand requirements fully
- Don't assume - ask about edge cases, error handling, UI/UX preferences
- Create beads issue with description: `bd create "Feature" --type feature --description "..."`
- For architecture changes, also update relevant spec in `/specs/`
- Get user approval before coding

### 2. Implementation Phase
- Write failing test first
- Implement minimal code to pass
- Refactor if needed
- Never write implementation code without a test

### 3. Verification Phase
- All tests must pass before committing
- Check if tests match the specifications in /specs
- Check if docs need updating (README.md, specs/)
- Close completed beads issues: `bd close <id>`

## Questions to Ask Before Implementing

- What is the expected input/output?
- What are the edge cases?
- How should errors be handled?
- Are there performance requirements?
- Does this need CLI commands, or just core logic?
- How does this interact with existing features?

## Issue Tracking

This project uses **bd (beads)** for issue tracking.

**Quick reference:**
- `bd ready` - Find unblocked work
- `bd create "Title" --type task --priority 2` - Create issue
- `bd close <id>` - Complete work
- `bd sync` - Sync with git (run at session end)

For full workflow context, run: `bd prime`

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
