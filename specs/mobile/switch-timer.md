# Mobile Switch Timer Spec

> 📹 **Demo:** [switch-timer-demo.mp4](../../docs/demos/switch-timer-demo.mp4)

## Overview

When a timer is running, users can switch directly to a different client/project/task without stopping first. This eliminates friction and prevents time gaps between entries.

## Screen Elements

| Element | testID | Description |
|---------|--------|-------------|
| Switch Selection Card | `switch-selection-button` | Tappable card showing current selection (visible when timer running) |
| Switch confirmation | - | Alert asking user to confirm the switch |

## Behavior

### When Timer is Running

- Show a "Switch" card below the timer display showing current client/project/task
- Card is tappable to open the selection picker
- When user completes a new selection:
  - Show confirmation alert: "Switch Timer? Stop [current] and start [new]?"
  - If confirmed: stop current timer and immediately start new one
  - If cancelled: dismiss picker and continue current timer

### Switch Operation

The switch operation is atomic:
1. Stop current timer with `ended_at = now`
2. Start new timer with `started_at = now` (same timestamp)
3. Update selection for smart defaults

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Switch to same client/project/task | No confirmation needed, no action taken |
| Network error during stop | Show error, don't start new timer |
| Network error during start | Show error, old timer already stopped (unfortunate but acceptable) |
| No timer running + select | Normal start behavior (no switch needed) |

## User Flows

### Switch Timer Flow

```
Timer Running (Client A / Project X)
         |
         v
    Tap Switch card
         |
         v
   Selection Picker opens
         |
         v
   Select Client B / Project Y
         |
         v
   Confirmation: "Switch timer from Client A to Client B?"
         |
    +----+----+
    |         |
  Cancel   Confirm
    |         |
    v         v
Continue   Stop Client A timer
current    Start Client B timer
timer      Update UI
```

### Quick Switch (Future Enhancement)

For power users, could add "quick switch" that skips confirmation. This could be:
- A setting to disable confirmation
- Long-press on recent entries to switch immediately
- Shake gesture to switch to last selection

## UI States

### Timer Running - Switch Available

```
┌─────────────────────────────────┐
│  Time Tracker          Logout   │
├─────────────────────────────────┤
│                                 │
│         02:45:33                │
│                                 │
│       Client A                  │
│       project x                 │
│                                 │
│   ┌───────────────────────────┐ │
│   │  Notes (optional)         │ │
│   └───────────────────────────┘ │
│                                 │
│   Started at 2:30 PM   ✎        │
│                                 │
│   ┌───────────────────────────┐ │
│   │  ⟳ Switch to different... │ │  <- New tappable card
│   └───────────────────────────┘ │
│                                 │
│  ┌──────────────────────────┐   │
│  │         Stop             │   │
│  └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

## Database Operations

### Switch Timer

```sql
-- Step 1: Stop current timer
UPDATE time_entries SET ended_at = NOW() WHERE id = ?

-- Step 2: Start new timer (same timestamp)
INSERT INTO time_entries (client_id, project_id, task_id, started_at)
VALUES (?, ?, ?, NOW())
```

## Confirmation Dialog

**Title:** Switch Timer?

**Message:**
```
Stop tracking "Client A / Project X" and start tracking "Client B / Project Y"?
```

**Buttons:**
- Cancel (secondary)
- Switch (primary)
