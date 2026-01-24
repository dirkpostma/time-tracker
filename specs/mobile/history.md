# Timer History Spec

## Overview

Display a list of past time entries grouped by day, with daily totals.

## Navigation

### TabBar
| Element | testID | Description |
|---------|--------|-------------|
| Tab bar container | `tab-bar` | Bottom navigation bar |
| Timer tab | `tab-timer` | Navigate to timer screen |
| History tab | `tab-history` | Navigate to history screen |

### Active States
- Active tab: Blue icon and text
- Inactive tab: Gray icon and text

## History Screen

### Screen Elements
| Element | testID | Description |
|---------|--------|-------------|
| Screen container | `history-screen` | Main history view |
| Entry list | `history-list` | Scrollable list of entries |
| Day header | `day-header-{date}` | Date header with total |
| Entry card | `entry-card-{id}` | Individual time entry |

### Empty State
| Element | testID | Description |
|---------|--------|-------------|
| Empty container | `history-empty` | Shown when no entries |
| Empty message | - | "No time entries yet" |

## Data Structure

### TimeEntry Display
```typescript
interface TimeEntryDisplay {
  id: string;
  clientName: string;
  projectName?: string;
  taskName?: string;
  description?: string;
  startedAt: Date;
  endedAt: Date;
  duration: number; // seconds
}
```

### Day Group
```typescript
interface DayGroup {
  date: string; // YYYY-MM-DD
  displayDate: string; // "Today", "Yesterday", "Mon, Jan 15"
  totalDuration: number;
  entries: TimeEntryDisplay[];
}
```

## Components

### DaySection
- Shows date header with daily total
- Contains list of TimeEntryCard components

### TimeEntryCard
Displays:
- Client name (bold)
- Project name (if present)
- Task name (if present)
- Description preview (truncated)
- Duration in HH:MM format
- Start/end times (10:00 AM - 11:30 AM)

## API Query

### Fetch Recent Entries
```sql
SELECT
  te.id,
  te.started_at,
  te.ended_at,
  te.description,
  c.name as client_name,
  p.name as project_name,
  t.name as task_name
FROM time_entries te
LEFT JOIN clients c ON te.client_id = c.id
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN tasks t ON te.task_id = t.id
WHERE te.ended_at IS NOT NULL
ORDER BY te.started_at DESC
LIMIT 100
```

## Duration Formatting

| Duration | Display |
|----------|---------|
| < 1 hour | "45m" |
| >= 1 hour | "1h 30m" |
| >= 10 hours | "10h 15m" |

## Date Formatting

| Date | Display |
|------|---------|
| Today | "Today" |
| Yesterday | "Yesterday" |
| This week | "Monday" |
| Older | "Mon, Jan 15" |

## Pull-to-Refresh

- History screen supports pull-to-refresh
- Refreshes entry list from server

## Components Structure

```
src/screens/
  └── HistoryScreen.tsx

src/components/
  ├── TabBar.tsx
  ├── TimeEntryCard.tsx
  └── DaySection.tsx

src/hooks/
  └── useTimeEntries.ts
```
