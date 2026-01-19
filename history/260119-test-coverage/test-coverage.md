# Test Coverage Report - 2026-01-19

## Summary

- Specs analyzed: 6
- Total scenarios: 47
- Covered: 29 (62%)
- Gaps: 18

## By Spec

### specs/cli/commands.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| client.add.success | tt client add <name> | Covered | packages/cli/src/client.test.ts:15 |
| client.list.success | tt client list | Covered | packages/cli/src/client.test.ts:40 |
| project.add.success | tt project add <name> --client <client> | Gap | - |
| project.list.success | tt project list | Gap | - |
| task.list.success | tt task list --client <c> --project <p> | Gap | - |
| auth.login.success | tt login | Covered | packages/cli/src/auth.test.ts:26 |
| auth.logout.success | tt logout | Covered | packages/cli/src/auth.test.ts:85 |
| auth.whoami.logged-in | tt whoami (logged in) | Covered | packages/cli/src/auth.test.ts:121 |
| auth.whoami.not-logged-in | tt whoami (not logged in) | Covered | packages/cli/src/auth.test.ts:147 |
| entity.name-match.found | Entity name exists | Gap | - |
| entity.name-match.not-found | Entity name doesn't exist | Gap | - |

### specs/cli/config.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| config.validation.invalid-url | Invalid URL format | Covered | packages/cli/src/config.test.ts:36 |
| config.validation.network-error | Connection failed (network) | Covered | packages/cli/src/config.test.ts:80 |
| config.validation.invalid-key | Invalid credentials (401/403) | Covered | packages/cli/src/config.test.ts:63 |
| config.validation.api-error | Other API error | Gap | - |
| config.runtime.stored-invalid | Stored credentials invalid | Gap | - |
| config.auth.not-logged-in | User runs command without auth | Covered | packages/cli/src/auth.test.ts:189 |
| config.auth.exempt-commands | config/login/logout/whoami run without auth | Gap | - |
| config.auth.token-refresh | Token expired but refreshable | Gap | - |
| config.auth.token-expired | Token expired and cannot refresh | Gap | - |
| config.firstrun.no-config | No config exists, user runs command | Gap | - |
| config.firstrun.user-confirms | User confirms setup (y) | Covered | packages/cli/src/config.test.ts:289 |
| config.firstrun.user-declines | User declines setup (n) | Covered | packages/cli/src/config.test.ts:319 |

### specs/cli/interactive-mode.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| interactive.running.show-info | tt with timer running | Gap | - |
| interactive.running.stop | User selects "Stop timer" | Covered | packages/cli/src/interactive.test.ts:234 |
| interactive.running.switch | User selects "Switch" | Covered | packages/cli/src/interactive.test.ts:252 |
| interactive.running.cancel | User selects "Cancel" | Covered | packages/cli/src/interactive.test.ts:274 |
| interactive.select.client | Client selection | Covered | packages/cli/src/interactive.test.ts:103 |
| interactive.select.project | Project selection | Covered | packages/cli/src/interactive.test.ts:136 |
| interactive.select.task | Task selection | Covered | packages/cli/src/interactive.test.ts:179 |
| interactive.select.description | Description prompt | Gap | - |
| interactive.select.start | All selections made | Covered | packages/cli/src/interactive.test.ts:53 |
| interactive.defaults.client | Interactive mode starts | Covered | packages/cli/src/interactive.test.ts:325 |
| interactive.defaults.project | Client selected | Covered | packages/cli/src/interactive.test.ts:350 |

### specs/time-tracking/flow.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| timer.start.running-exists | Timer already running | Covered | packages/cli/src/timeEntry.test.ts:64 |
| timer.start.client-missing | Client doesn't exist | Gap | - |
| timer.start.project-missing | Project doesn't exist | Gap | - |
| timer.start.task-missing | Task doesn't exist | Gap | - |
| timer.start.success | All valid, no running timer | Covered | packages/cli/src/timeEntry.test.ts:37 |
| timer.stop.no-running | No timer running | Covered | packages/cli/src/timeEntry.test.ts:121 |
| timer.stop.desc-exists | Description provided, one already exists | Gap | - |
| timer.stop.success | Timer running | Covered | packages/cli/src/timeEntry.test.ts:111 |
| timer.status.running | Timer is running | Covered | packages/cli/src/timeEntry.test.ts:151 |
| timer.status.not-running | No timer running | Covered | packages/cli/src/timeEntry.test.ts:145 |

### specs/time-tracking/recent.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| recent.save | Start timer via interactive mode | Covered | packages/cli/src/recent.test.ts:59, packages/cli/src/interactive.test.ts:305 |
| recent.load | Interactive mode starts | Covered | packages/cli/src/recent.test.ts:40 |
| recent.missing-file | File doesn't exist | Covered | packages/cli/src/recent.test.ts:34 |
| recent.invalid-file | File exists but invalid JSON | Covered | packages/cli/src/recent.test.ts:49 |
| recent.first-use | First time using interactive mode | Gap | - |

### specs/time-tracking/timer-switch.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| timer.switch.detect-running | Detect running timer on start | Covered | packages/cli/src/timerSwitch.test.ts:129 |
| timer.switch.user-confirms | User confirms switch (y) | Covered | packages/cli/src/timerSwitch.test.ts:90 |
| timer.switch.user-declines | User declines switch (n) | Covered | packages/cli/src/timerSwitch.test.ts:108 |
| timer.switch.force-flag | --force flag used | Covered | packages/cli/src/timerSwitch.test.ts:57 |

## Gaps Summary

The following 18 scenarios need tests:

1. **project.add.success** - tt project add <name> --client <client>
2. **project.list.success** - tt project list
3. **task.list.success** - tt task list --client <c> --project <p>
4. **entity.name-match.found** - Entity name exists
5. **entity.name-match.not-found** - Entity name doesn't exist
6. **config.validation.api-error** - Other API error
7. **config.runtime.stored-invalid** - Stored credentials invalid
8. **config.auth.exempt-commands** - config/login/logout/whoami run without auth
9. **config.auth.token-refresh** - Token expired but refreshable
10. **config.auth.token-expired** - Token expired and cannot refresh
11. **config.firstrun.no-config** - No config exists, user runs command
12. **interactive.running.show-info** - tt with timer running
13. **interactive.select.description** - Description prompt
14. **timer.start.client-missing** - Client doesn't exist
15. **timer.start.project-missing** - Project doesn't exist
16. **timer.start.task-missing** - Task doesn't exist
17. **timer.stop.desc-exists** - Description provided, one already exists
18. **recent.first-use** - First time using interactive mode
