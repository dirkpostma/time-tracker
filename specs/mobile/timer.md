# Mobile Timer Spec

## Overview

TimerScreen displays current timer state and allows starting/stopping time entries.

## Screen Elements

| Element        | testID          | Description                        |
|----------------|-----------------|-------------------------------------|
| Title          | -               | "Time Tracker" header               |
| Logout button  | `logout-button` | Returns to login screen             |
| Timer display  | `timer-display` | Shows HH:MM:SS elapsed time         |
| Client name    | `client-name`   | Shows client name when timer running|
| Project name   | `project-name`  | Shows project name when timer running (if selected) |
| Task name      | `task-name`     | Shows task name when timer running (if selected) |
| Start button   | `start-button`  | Starts new timer (when stopped)     |
| Stop button    | `stop-button`   | Stops current timer (when running)  |
| User email     | `user-email`    | Shows "Logged in as {email}"        |

## Timer States

### Stopped State
- Timer shows `00:00:00`
- Start button visible
- Stop button hidden
- No client name shown

### Running State
- Timer shows elapsed time (updates every second)
- Stop button visible
- Start button hidden
- Client name shown
- Project name shown (if timer has project)
- Task name shown (if timer has task)

## Timer Display Format

```
HH:MM:SS
```

- Hours: 2 digits, zero-padded
- Minutes: 2 digits, zero-padded
- Seconds: 2 digits, zero-padded
- Uses tabular-nums font variant for consistent width

## Start Timer Flow

1. User taps Start
2. Fetch or create default client
3. Create time_entry with `started_at = now`, `ended_at = null`
4. Update UI to running state
5. Start elapsed time counter

## Stop Timer Flow

1. User taps Stop
2. Update time_entry with `ended_at = now`
3. Update UI to stopped state
4. Reset elapsed time to 0

## Default Client Behavior

When starting a timer:
1. Query for any existing client
2. If found → Use first client
3. If none → Create "Default Client"

## Database Queries

### Find Running Timer
```sql
SELECT * FROM time_entries WHERE ended_at IS NULL LIMIT 1
```

### Start Timer
```sql
INSERT INTO time_entries (client_id, started_at) VALUES (?, NOW())
```

### Stop Timer
```sql
UPDATE time_entries SET ended_at = NOW() WHERE id = ?
```
