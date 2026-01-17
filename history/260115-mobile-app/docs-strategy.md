# Documentation Strategy

## Hybrid Approach

- `specs/` - Stable documentation (Screaming Architecture by domain)
- `beads` - Work items (tasks, bugs, features)

## Specs Reorganization

Reorganize into Screaming Architecture:

```
specs/
├── core/
│   └── data-model.md
├── time-tracking/
│   ├── flow.md
│   ├── timer-switch.md
│   └── recent.md
├── cli/
│   ├── commands.md
│   ├── config.md
│   └── interactive-mode.md
└── mobile/
    ├── architecture.md
    ├── auth.md
    ├── screens/
    │   ├── status.md
    │   └── start-timer.md
    └── testing.md
```

## File Moves

| From | To |
|------|-----|
| `specs/data-model.md` | `specs/core/data-model.md` |
| `specs/time-tracking-flow.md` | `specs/time-tracking/flow.md` |
| `specs/timer-switch-confirmation.md` | `specs/time-tracking/timer-switch.md` |
| `specs/recent.md` | `specs/time-tracking/recent.md` |
| `specs/cli-commands.md` | `specs/cli/commands.md` |
| `specs/config.md` | `specs/cli/config.md` |
| `specs/interactive-mode.md` | `specs/cli/interactive-mode.md` |

## New Mobile Specs

| File | Content |
|------|---------|
| `specs/mobile/architecture.md` | Monorepo, code sharing, packages |
| `specs/mobile/auth.md` | CLI + mobile auth flow, RLS |
| `specs/mobile/screens/status.md` | Status screen wireframe |
| `specs/mobile/screens/start-timer.md` | Start timer flow |
| `specs/mobile/testing.md` | Maestro E2E test specs |
