# Edit Running Timer Start Time

## Overview

Allow users to edit the start time of a currently running timer. This handles the common scenario where a user forgets to start the timer and wants to backdate it.

## User Stories

1. **As a user**, I want to adjust my running timer's start time when I forgot to start it on time
2. **As a user**, I want visual feedback that my start time was updated

## UI/UX

### Timer Screen (when timer is running)

The start time should be displayed and tappable:

```
┌─────────────────────────────────┐
│  Time Tracker           Logout  │
├─────────────────────────────────┤
│                                 │
│         01:23:45                │
│                                 │
│       Test Client               │
│          test                   │
│                                 │
│   Started at 11:30 PM  ✎        │  ← Tappable, opens time picker
│                                 │
│   ┌─────────────────────────┐   │
│   │         Stop            │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Interaction Flow

1. User taps "Started at [time] ✎"
2. Native time picker opens
3. User selects new start time
4. Validation: new start time must be in the past (before now)
5. Timer updates immediately with new duration
6. Success feedback (brief toast or the time flashes)

## Technical Implementation

### Components to Modify

1. **TimerScreen.tsx**
   - Add start time display with edit icon
   - Add state for time picker visibility
   - Add DateTimePicker component
   - Handle time change with validation

2. **useTimer hook** (or similar)
   - Add `updateStartTime(newTime: Date)` function
   - Call API to update the running entry's `started_at`

3. **TimeEntryRepository**
   - Already supports `update()` with `started_at` field ✓

### Validation Rules

- New start time must be ≤ current time (can't start in the future)
- New start time should be within reasonable bounds (e.g., not more than 24h ago)
- Show error alert if validation fails

### API

Uses existing `updateTimeEntry` mutation:
```typescript
await updateEntry(runningEntryId, {
  started_at: newStartTime.toISOString()
});
```

## Test IDs

- `timer-start-time-display` - The "Started at X" text
- `timer-start-time-button` - Tappable area to edit
- `timer-start-time-picker` - The time picker modal

## Maestro Test Cases

1. **edit_running_timer_flow.yaml**
   - Start a timer
   - Verify start time is displayed
   - Tap start time to open picker
   - Change time
   - Verify duration updates
   - Stop timer
   - Verify entry in history has updated time

## Edge Cases

1. Timer not running → start time section not shown
2. Network error during update → show error, revert display
3. User picks future time → show validation error
4. User cancels picker → no change

## Success Criteria

- [ ] Start time visible on running timer
- [ ] Tapping opens native time picker
- [ ] Changing time updates duration immediately
- [ ] Validation prevents future times
- [ ] Maestro test passes
