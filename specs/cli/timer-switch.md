# Timer Switch Spec

## Overview

When a user starts a new timer while another is already running, the `--force` flag is required to switch.

## Behavior

### Starting a Timer When One is Running

Without `--force`:
1. Detect that a timer is already running
2. Return error: "Timer already running. Use --force to switch."
3. Current timer continues running

With `--force`:
1. Stop the current timer (set `ended_at` to now)
2. Start the new timer as requested
3. Display confirmation of both actions

### Command Syntax

```
tt start --client <client> --force
```

## Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| timer.switch.detect-running | Detect running timer on start | Show current timer info (client, project, task, duration) |
| timer.switch.require-force | No --force flag, timer running | Error: "Timer already running. Use --force to switch." |
| timer.switch.force-flag | --force flag used | Stop old timer, start new timer, show confirmation |

## Example Usage

### Without --force (Error)

```
$ tt start --client Acme
Error: Timer already running for BigCorp / Website (1h 23m).
Use --force to stop it and start a new one.
```

### With --force (Success)

```
$ tt start --client Acme --force
Stopped timer for BigCorp / Website (1h 23m)
Started timer for Acme
```
