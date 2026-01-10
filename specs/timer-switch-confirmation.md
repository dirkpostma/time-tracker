# Timer Switch Confirmation Spec

## Overview

When a user starts a new timer while another is already running, prompt for confirmation before switching.

## Behavior

### Starting a Timer When One is Running

1. Detect that a timer is already running
2. Display current timer info (client, project, task if present, duration)
3. Prompt: "A timer is already running. Stop it and start a new one? [y/n]"
4. If user confirms (y):
   - Stop the current timer (set `ended_at` to now)
   - Start the new timer as requested
   - Display confirmation of both actions
5. If user declines (n):
   - Keep the current timer running
   - Do not start the new timer
   - Display message that current timer continues

### Non-Interactive Mode

When running in non-interactive mode (e.g., scripts), provide a `--force` flag:

```
tt start --client <client> --force
```

With `--force`:
- Skip confirmation prompt
- Automatically stop the running timer and start the new one

## Example Interactions

### User Confirms Switch

```
$ tt start --client Acme
A timer is already running:
  Client: BigCorp
  Project: Website
  Duration: 1h 23m

Stop it and start a new one? [y/n] y

Stopped timer for BigCorp / Website (1h 23m)
Started timer for Acme
```

### User Declines Switch

```
$ tt start --client Acme
A timer is already running:
  Client: BigCorp
  Project: Website
  Duration: 1h 23m

Stop it and start a new one? [y/n] n

Keeping current timer running.
```

### Force Flag

```
$ tt start --client Acme --force
Stopped timer for BigCorp / Website (1h 23m)
Started timer for Acme
```
