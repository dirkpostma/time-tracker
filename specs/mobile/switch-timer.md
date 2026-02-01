# Mobile Switch Timer Spec

> 📹 **Demo:** [switch-timer-demo.mp4](../../docs/demos/switch-timer-demo.mp4)

## Overview

When a timer is running, users can switch directly to a different client/project/task without stopping first. This eliminates friction and prevents time gaps between entries.

## Screen Elements

| Element | testID | Description |
|---------|--------|-------------|
| Switch Selection Card | `switch-selection-button` | Tappable card visible when timer is running |

## Behavior

### When Timer is Running

- Show a "Switch" card below the timer display with ↻ icon
- Card is tappable to open the selection picker
- When user completes a new selection:
  - Switch happens immediately (no confirmation needed)
  - Old timer stops and new timer starts atomically

### Why No Confirmation?

User intent is clear:
1. User explicitly taps "Switch to different client/project"
2. User goes through full client/project/task selection
3. User completes selection

Adding a confirmation would be redundant friction.

### Switch Operation

The switch operation is atomic:
1. Stop current timer with `ended_at = now`
2. Start new timer with `started_at = now` (same timestamp)
3. Update selection for smart defaults

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Switch to same client/project/task | No action taken (silently ignored) |
| Network error during switch | Show error, refresh state |
| No timer running + select | Normal start behavior (no switch needed) |

## User Flow

```
Timer Running (Client A / Project X)
         |
         v
    Tap "↻ Switch to different client/project"
         |
         v
   Selection Picker opens
         |
         v
   Select Client B / Project Y
         |
         v
   Timer switches immediately
   - Client A timer stops
   - Client B timer starts
   - UI updates
```

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
│   │  ↻ Switch to different... │ │  <- Tappable card
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
