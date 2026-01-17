# Beads Issue Tracking

## Create Issues

```bash
# Epic
bd create --title="Mobile app MVP" --type=feature --priority=1

# Documentation (priority 1 - do first)
bd create --title="Reorganize specs/ into Screaming Architecture" --type=task --priority=1
bd create --title="Write specs/mobile/architecture.md" --type=task --priority=1
bd create --title="Write specs/mobile/auth.md" --type=task --priority=1
bd create --title="Write specs/mobile/screens/*.md" --type=task --priority=2
bd create --title="Write specs/mobile/testing.md" --type=task --priority=2

# Phase 1: Monorepo
bd create --title="Set up monorepo with npm workspaces" --type=task --priority=2
bd create --title="Extract @time-tracker/core package" --type=task --priority=2
bd create --title="Extract @time-tracker/repositories package" --type=task --priority=2
bd create --title="Migrate CLI to packages/cli" --type=task --priority=2

# Phase 2: Auth
bd create --title="Add user_id and RLS to database" --type=task --priority=2
bd create --title="Add tt login/logout commands to CLI" --type=task --priority=2

# Phase 3: Expo
bd create --title="Initialize Expo app in packages/mobile" --type=task --priority=2
bd create --title="Configure Metro for workspaces" --type=task --priority=2

# Phase 4: Mobile Auth
bd create --title="Implement Supabase Auth in mobile app" --type=task --priority=2

# Phase 5: Timer
bd create --title="Build timer status screen" --type=task --priority=2
bd create --title="Build start timer flow" --type=task --priority=2

# Phase 6: Testing
bd create --title="Add unit and component tests for mobile" --type=task --priority=3
bd create --title="Add Maestro E2E tests" --type=task --priority=2
bd create --title="Polish UI and error handling" --type=task --priority=3
```

## Add Dependencies

```bash
bd dep add <core-pkg> <monorepo-setup>
bd dep add <repos-pkg> <core-pkg>
bd dep add <cli-migrate> <repos-pkg>
bd dep add <expo-init> <cli-migrate>
```
