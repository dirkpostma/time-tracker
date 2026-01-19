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

1. If a timer is already running, prompt to stop it and start the new one (see `cli/timer-switch.md`)
2. If client doesn't exist, prompt to create it
3. If project is provided and doesn't exist, prompt to create it
4. If task is provided and doesn't exist, prompt to create it
5. Create a new TimeEntry with `started_at` set to now, `ended_at` null
6. Optionally set description

## Stopping a Timer

1. Find the running TimeEntry (where `ended_at` is null)
2. If no timer is running, notify the user
3. If description provided and one already exists, warn user (overwrite? y/n)
4. Set `ended_at` to now

## Checking Status

- Show the currently running timer (client, project if present, task if present, duration so far)
- If no timer running, say so

## Scenarios

### Starting Timer

| ID | Scenario | Expected |
|----|----------|----------|
| timer.start.running-exists | Timer already running | Prompt to stop and start new (see timer-switch.md) |
| timer.start.client-missing | Client doesn't exist | Prompt to create it |
| timer.start.project-missing | Project doesn't exist | Prompt to create it |
| timer.start.task-missing | Task doesn't exist | Prompt to create it |
| timer.start.success | All valid, no running timer | Create TimeEntry with started_at=now, ended_at=null |

### Stopping Timer

| ID | Scenario | Expected |
|----|----------|----------|
| timer.stop.no-running | No timer running | Notify user "No timer is running" |
| timer.stop.desc-exists | Description provided, one already exists | Warn and prompt "overwrite? y/n" |
| timer.stop.success | Timer running | Set ended_at=now |

### Status Check

| ID | Scenario | Expected |
|----|----------|----------|
| timer.status.running | Timer is running | Show client, project, task, duration |
| timer.status.not-running | No timer running | Show "No timer running" |
