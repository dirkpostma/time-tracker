# Edit Time Entry Spec

## Overview

Allow users to view, edit, and delete time entries from history. Also support creating manual entries for forgotten time tracking.

## User Problem

"I often forget to stop or start the timer. I want to be able to change or update it later."

## Features

1. **View Entry Details** - Tap entry in history to see full details
2. **Edit Start/End Time** - Adjust when entry started/ended
3. **Edit Description** - Modify entry description
4. **Edit Client/Project/Task** - Change entry classification
5. **Delete Entry** - Remove incorrect entries
6. **Manual Entry** - Add entry for past work (not tracked in real-time)

## Navigation

### From History Screen
- Tap on any `entry-card-{id}` → opens Entry Detail screen
- "+" FAB or header button → opens Manual Entry screen

## Entry Detail Screen

### Screen Elements
| Element | testID | Description |
|---------|--------|-------------|
| Screen container | `entry-detail-screen` | Main detail view |
| Back button | `back-button` | Return to history |
| Delete button | `delete-entry-button` | Delete this entry |
| Save button | `save-entry-button` | Save changes |
| Client field | `entry-client-field` | Tap to change client |
| Project field | `entry-project-field` | Tap to change project |
| Task field | `entry-task-field` | Tap to change task |
| Date field | `entry-date-field` | Tap to change date |
| Start time field | `entry-start-time` | Tap to edit start time |
| End time field | `entry-end-time` | Tap to edit end time |
| Duration display | `entry-duration` | Calculated duration (read-only) |
| Description input | `entry-description-input` | Edit description |

### Time Picker
- Native date/time picker
- Validates: end time > start time
- Shows error if invalid range

### Duration Calculation
- Auto-calculated from start/end times
- Displayed as "Xh Ym" format
- Updates live as times change

## Manual Entry Screen

### Screen Elements
| Element | testID | Description |
|---------|--------|-------------|
| Screen container | `manual-entry-screen` | Create new entry |
| Client picker | `manual-client-picker` | Select client |
| Project picker | `manual-project-picker` | Select project |
| Task picker | `manual-task-picker` | Select task (optional) |
| Date picker | `manual-date-picker` | Select date |
| Start time picker | `manual-start-time` | Select start time |
| End time picker | `manual-end-time` | Select end time |
| Description input | `manual-description` | Add description |
| Save button | `manual-save-button` | Create entry |

### Defaults
- Date: Today
- Start time: 09:00
- End time: 10:00
- Client: Last used client (if any)

## Delete Confirmation

### Alert Dialog
| Element | Description |
|---------|-------------|
| Title | "Delete Entry?" |
| Message | "This will permanently delete this time entry." |
| Cancel button | Dismiss dialog |
| Delete button | Confirm deletion (destructive style) |

## API Operations

### Update Entry
```sql
UPDATE time_entries 
SET 
  started_at = ?,
  ended_at = ?,
  description = ?,
  client_id = ?,
  project_id = ?,
  task_id = ?
WHERE id = ?
```

### Delete Entry
```sql
DELETE FROM time_entries WHERE id = ?
```

### Create Manual Entry
```sql
INSERT INTO time_entries (id, user_id, client_id, project_id, task_id, description, started_at, ended_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

## Validation Rules

1. End time must be after start time
2. Entry cannot overlap with another entry (warning, not blocking)
3. Client is required
4. Project is optional
5. Task is optional (requires project if set)
6. Description is optional
7. Maximum entry duration: 24 hours (warn if exceeded)

## User Flows

### Edit Existing Entry
1. Open History tab
2. Tap on entry card
3. Entry Detail screen opens with current values
4. Modify any field
5. Tap Save
6. Return to History (updated)

### Delete Entry
1. Open entry detail
2. Tap Delete button
3. Confirm in dialog
4. Entry removed, return to History

### Add Manual Entry
1. History screen → tap "+" button
2. Manual Entry screen opens
3. Select client (required)
4. Optionally select project/task
5. Set date, start time, end time
6. Add description (optional)
7. Tap Save
8. Return to History with new entry

## Components Structure

```
src/screens/
  ├── HistoryScreen.tsx (add FAB for manual entry)
  ├── EntryDetailScreen.tsx (new)
  └── ManualEntryScreen.tsx (new)

src/components/
  ├── TimePicker.tsx (new)
  ├── DatePicker.tsx (new)
  └── DurationDisplay.tsx (new)

src/repositories/
  └── timeEntry.ts (add update, delete methods)
```

## Test Cases (Maestro)

### edit-time-entry.yaml
- Open history, tap entry, verify detail screen opens
- Edit start time, verify duration updates
- Edit end time, verify duration updates
- Save changes, verify history shows updates
- Edit description, save, verify persisted

### delete-time-entry.yaml
- Open entry detail, tap delete
- Cancel delete, verify entry still exists
- Confirm delete, verify entry removed from history

### manual-time-entry.yaml
- Tap "+" on history screen
- Fill all fields
- Save, verify new entry appears in history
- Create entry with only required fields (client)
- Verify validation: end time before start time shows error
