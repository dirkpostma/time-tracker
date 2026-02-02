# Timer Spec

Core timer functionality for the time-tracking application.

## Constraints

- Only one timer can run at a time
- A timer is considered "running" when `ended_at` is null

## Timer States

| State | Condition |
|-------|-----------|
| Running | `ended_at` is null |
| Stopped | `ended_at` is not null |

## Starting a Timer

1. If a timer is already running, require `--force` flag to switch (see `cli/timer-switch.md`)
2. Client must exist (error if not found)
3. Project must exist if provided (error if not found)
4. Task must exist if provided (error if not found)
5. Create a new TimeEntry with `started_at` set to now, `ended_at` null
6. Optionally set description

## Stopping a Timer

1. Find the running TimeEntry (where `ended_at` is null)
2. If no timer is running, notify the user
3. If description provided with `--force`, overwrite existing description
4. Set `ended_at` to now

## Checking Status

- Show the currently running timer (client, project if present, task if present, duration so far)
- If no timer running, say so

## Scenarios

### Starting Timer

| ID | Scenario | Expected |
|----|----------|----------|
| timer.start.running-exists | Timer already running | Error unless --force flag provided (see timer-switch.md) |
| timer.start.client-missing | Client doesn't exist | Error: "Client '<name>' not found" |
| timer.start.project-missing | Project doesn't exist | Error: "Project '<name>' not found" |
| timer.start.task-missing | Task doesn't exist | Error: "Task '<name>' not found" |
| timer.start.success | All valid, no running timer | Create TimeEntry with started_at=now, ended_at=null |

### Stopping Timer

| ID | Scenario | Expected |
|----|----------|----------|
| timer.stop.no-running | No timer running | Notify user "No timer is running" |
| timer.stop.desc-exists | Description provided, one already exists | Overwrite with --force, otherwise keep existing |
| timer.stop.success | Timer running | Set ended_at=now |

### Status Check

| ID | Scenario | Expected |
|----|----------|----------|
| timer.status.running | Timer is running | Show client, project, task, duration |
| timer.status.not-running | No timer running | Show "No timer running" |
