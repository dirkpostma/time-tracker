# Mobile App Implementation Plan

## Overview

Transform the CLI time-tracker into a monorepo supporting both CLI and Expo mobile app.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Framework | Expo (managed workflow) |
| Platforms | iOS & Android |
| MVP Scope | Timer only (start/stop, status) |
| Code sharing | Monorepo with npm workspaces |
| Offline | Online only |
| Auth | Supabase Auth (same account CLI + mobile) |

## Phases

| Phase | Description | Details |
|-------|-------------|---------|
| 0 | Documentation | [docs-strategy.md](docs-strategy.md) |
| 1 | Monorepo setup | [monorepo.md](monorepo.md) |
| 2 | Database & Auth | [auth.md](auth.md) |
| 3-5 | Mobile app | [mobile.md](mobile.md) |
| 6 | Testing | [testing.md](testing.md) |

## Beads Issues

See [beads-issues.md](beads-issues.md) for issue creation commands.

## Verification Checklist

- [ ] All specs written and reviewed
- [ ] `npm test` passes from root
- [ ] CLI works: `npm run cli -- status`
- [ ] `tt login` / `tt logout` / `tt whoami` work
- [ ] Expo dev server starts
- [ ] Mobile login/signup works
- [ ] Timer start/stop works on mobile
- [ ] `maestro test .maestro/` passes
