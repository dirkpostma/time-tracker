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

## Documentation

- **Specs**: `/specs/*.md` - stable architecture and design docs
- **Plans**: `history/YYMMDD-feature-name.md` - feature plans (committed to git)

## Feature Development

**Use `/start-feature <name>` to begin any new feature.**

This skill handles:
1. Creating a feature branch
2. Gathering requirements through clarifying questions
3. Writing a plan in `history/`
4. Getting your approval before implementation

See `.claude/skills/start-feature.md` for full workflow details.

### Implementation (after plan approval)
- Write failing test first
- Implement minimal code to pass
- Refactor if needed
- Never write implementation code without a test

### Verification
- All tests must pass before committing
- Check if tests match specs in `/specs/`
- Update docs if needed (README.md, specs/)

### Git Commits
- **Always ask for confirmation before committing** - never commit automatically

## Session Completion

When ending a work session:

1. **Run quality gates** (if code changed) - tests, linters, builds
2. **Push to remote**:
   ```bash
   git pull --rebase
   git push
   ```
3. **Verify** - `git status` shows "up to date with origin"
