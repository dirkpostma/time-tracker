# Migration Plan (Hybrid Approach with spec.md)

## Overview

Migrate from current `/specs/` structure to hybrid:
- System-level docs stay in `/specs/` (restructured)
- Package-level specs move to `packages/*/spec.md`

---

## Phase 1: Create New Structure (15 min)

### 1.1 Restructure /specs/

```bash
# Create new folders
mkdir -p specs/architecture
mkdir -p specs/features

# Move and rename
mv specs/core/data-model.md specs/architecture/data-model.md

# Remove old folders (after content migrated)
# rm -rf specs/core specs/cli specs/time-tracking
```

### 1.2 Create specs/README.md

```markdown
# Time Tracker

CLI tool for tracking time on client/project/task hierarchy.

## Documentation

| Topic | Location |
|-------|----------|
| Architecture | [./architecture/](./architecture/) |
| Features | [./features/](./features/) |
| Core spec | [../packages/core/spec.md](../packages/core/spec.md) |
| Repositories spec | [../packages/repositories/spec.md](../packages/repositories/spec.md) |
| CLI spec | [../packages/cli/spec.md](../packages/cli/spec.md) |

## Data Model

Client → Project → Task → TimeEntry

See [architecture/data-model.md](./architecture/data-model.md) for details.

## Quick Links

- Start here: [Architecture Overview](./architecture/overview.md)
- Commands: [CLI spec](../packages/cli/spec.md)
- Business rules: [Core spec](../packages/core/spec.md)
```

---

## Phase 2: Architecture Docs (20 min)

### 2.1 Create specs/architecture/overview.md

Content:
- System goals
- Tech stack
- Key constraints
- Design principles

### 2.2 Create specs/architecture/layers.md

Content:
- Layer diagram (Core → Repositories → CLI)
- Responsibilities of each layer
- Dependency rules

### 2.3 Update specs/architecture/data-model.md

Enhance existing with:
- Entity relationship diagram
- Links to type definitions in core

---

## Phase 3: Feature Docs (20 min)

### 3.1 Create specs/features/time-tracking.md

Consolidate from:
- `specs/time-tracking/flow.md`
- `specs/time-tracking/timer-switch.md`

Add requirement IDs (req-feat-*).

### 3.2 Create specs/features/authentication.md

Document:
- Login flow
- Logout flow
- Session management
- Token refresh

---

## Phase 4: Package spec.md Files (45 min)

### 4.1 packages/core/spec.md

Create new file. Migrate content from:
- `specs/core/data-model.md` (entity definitions)
- `specs/time-tracking/flow.md` (timer rules)

Add:
- Module overview table
- Requirement IDs (req-core-*)
- Test references

### 4.2 packages/repositories/spec.md

Create new file with:
- Repository interfaces
- Configuration format (from `specs/cli/config.md`)
- Requirement IDs (req-repo-*)

### 4.3 packages/repositories/src/supabase/spec.md

Create for Supabase-specific details:
- Connection management
- Auth handling
- Error formatting

### 4.4 packages/cli/spec.md

Create new file. Migrate from:
- `specs/cli/commands.md`
- `specs/cli/interactive-mode.md`
- `specs/time-tracking/recent.md`

Add:
- Command reference
- Requirement IDs (req-cli-*)
- Behavior specs

---

## Phase 5: Add Requirement IDs (30 min)

Go through all specs and add IDs:

| Prefix | Location |
|--------|----------|
| req-arch-* | specs/architecture/ |
| req-feat-* | specs/features/ |
| req-core-* | packages/core/spec.md |
| req-repo-* | packages/repositories/spec.md |
| req-cli-* | packages/cli/spec.md |

---

## Phase 6: Cleanup (10 min)

### 6.1 Remove old structure

```bash
rm -rf specs/core
rm -rf specs/cli
rm -rf specs/time-tracking
```

### 6.2 Update claude.md

Replace Documentation Strategy section with new workflow.

### 6.3 Verify

- [ ] All old content migrated
- [ ] No broken links
- [ ] Navigation works

---

## Content Migration Map

| Old Location | New Location |
|--------------|--------------|
| `specs/core/data-model.md` | `specs/architecture/data-model.md` |
| `specs/cli/commands.md` | `packages/cli/spec.md` |
| `specs/cli/config.md` | `packages/repositories/spec.md` |
| `specs/cli/interactive-mode.md` | `packages/cli/spec.md` |
| `specs/time-tracking/flow.md` | `specs/features/time-tracking.md` + `packages/core/spec.md` |
| `specs/time-tracking/timer-switch.md` | `specs/features/time-tracking.md` |
| `specs/time-tracking/recent.md` | `packages/cli/spec.md` |

---

## New Files to Create

| File | Content Source |
|------|----------------|
| `specs/README.md` | New |
| `specs/architecture/overview.md` | New |
| `specs/architecture/layers.md` | New |
| `specs/features/time-tracking.md` | Consolidate from time-tracking/*.md |
| `specs/features/authentication.md` | New |
| `packages/core/spec.md` | New + migrate |
| `packages/repositories/spec.md` | New + migrate config.md |
| `packages/repositories/src/supabase/spec.md` | New |
| `packages/cli/spec.md` | New + migrate |

---

## Estimated Time

| Phase | Time |
|-------|------|
| 1. Create structure | 15 min |
| 2. Architecture docs | 20 min |
| 3. Feature docs | 20 min |
| 4. Package spec.md files | 45 min |
| 5. Requirement IDs | 30 min |
| 6. Cleanup | 10 min |
| **Total** | **~2.5 hours** |

---

## Rollback

If issues arise:
```bash
git checkout HEAD~N -- specs/
git checkout HEAD~N -- packages/*/spec.md
```

Keep commits atomic per phase for easy rollback.
